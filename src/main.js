const { BrowserWindow, Notification, ipcMain } = require("electron");
const { getConnection } = require("./database");
var easyinvoice = require('easyinvoice');
const fs = require("original-fs");
const path = require("path");

let window;


ipcMain.handle('createProduct', async (event, product) => {
  try {
    const conn = await getConnection();
    // product.price = parseFloat(product.price);
    const result = await conn.query("INSERT INTO product SET ?", product);
    product.id = result.insertId;

    // Notify the User
    new Notification({
      title: "Success",
      body: "New Product Saved Successfully",
    }).show();

    window.reload();

    // Return the created Product
    return product;
  } catch (error) {
    console.log(error);
  }
});

ipcMain.handle('createBranch', async (event, branch) => {
  try {
    const conn = await getConnection();
    const result = await conn.query("INSERT INTO branches SET ?", branch);
    branch.id = result.insertId;

    // Notify the User
    new Notification({
      title: "Success",
      body: "New Branch Saved Successfully",
    }).show();

    window.reload();

    // Return the created Product
    return branch;
  } catch (error) {
    console.log(error);
  }
});

ipcMain.handle('mapProductToBranch', async (event, mappedData) => {
  try {
    const conn = await getConnection();
    const result = await conn.query("INSERT INTO mapped_product SET ?", mappedData);
    const result_1 = await conn.query("UPDATE product SET mapped = '1' WHERE productName = ?", [mappedData.product]);
    mappedData.id = result.insertId;

    // Notify the User
    new Notification({
      title: "Success",
      body: `${mappedData.product} mapped to ${mappedData.branch} successfully`,
    }).show();

    window.reload();

    // Return the created Product
    return mappedData;
  } catch (error) {
    console.log(error);
  }
});

ipcMain.handle('getProducts', async () => {
  try {
    const conn = await getConnection();
    const results = await conn.query("SELECT * FROM product ORDER BY id DESC");
    return results;
  } catch (err) {
    console.log(err);
  }
});

ipcMain.handle('getBranches', async () => {
  try {
    const conn = await getConnection();
    const results = await conn.query("SELECT * FROM branches ORDER BY id DESC");
    return results;
  } catch (err) {
    console.log(err);
  }
});

ipcMain.handle('getBranchesNames', async () => {
  try {
    const conn = await getConnection();
    const results = await conn.query("SELECT branchName FROM branches ORDER BY branchName ASC");
    return results;
  } catch (err) {
    console.log(err);
  }
});

ipcMain.handle('deleteProduct', async (event, id) => {
  const conn = await getConnection();
  await conn.query("DELETE FROM product WHERE id = ?", id);
  const results = await conn.query("SELECT * FROM product ORDER BY id DESC");
  window.reload();
  return results;
});

ipcMain.handle('deleteBranch', async (event, id) => {
  const conn = await getConnection();
  await conn.query("DELETE FROM branches WHERE id = ?", id);
  window.reload();
});

ipcMain.handle('deleteMappedProduct', async (event, id) => {
  const conn = await getConnection();
  await conn.query("DELETE FROM mapped_product WHERE id = ?", id);
  window.reload();
});

ipcMain.handle('getMappedProducts', async (event) => {
  const conn = await getConnection();
  const results = await conn.query("SELECT * From mapped_product ORDER BY mapDate DESC;");
  return results;
});

ipcMain.handle('getProductById', async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("SELECT * FROM product WHERE id = ?", id);
  return result[0];
});

ipcMain.handle('getBranchById', async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("SELECT * FROM branches WHERE id = ?", id);
  return result[0];
});

ipcMain.handle('getMappedProductById', async (event, id) => {
  const conn = await getConnection();
  const result = await conn.query("SELECT * FROM mapped_product WHERE id = ?", id);
  return result[0];
});

ipcMain.handle('updateProduct', async (event, id, product) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE product SET ? WHERE id = ?", [
    product,
    id,
  ]);
  window.reload();
});

ipcMain.handle('updateBranch', async (event, id, branch) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE branches SET ? WHERE id = ?", [
    branch,
    id,
  ]);
  window.reload();
});

ipcMain.handle('updateMappedProduct', async (event, id, mapped_product) => {
  const conn = await getConnection();
  const result = await conn.query("UPDATE mapped_product SET ? WHERE id = ?", [
    mapped_product,
    id,
  ]);
  window.reload();
});

ipcMain.handle('printReport', async (ev, mapDate) => {
  //select *from PatternDemo where Name like '%Jo%';
  const conn = await getConnection();
  const result = await conn.query(`select * from mapped_product where mapDate like '%${mapDate}%';`);

  let data = {
    // Customize enables you to provide your own templates
    // Please review the documentation for instructions and examples
    "customize": {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
    },
    "images": {
        // The logo on top of your invoice
        "logo": convertImgToBase64(),
        // The invoice background
        "background": convertImgToBase64()
    },
    // Your own data
    "sender": {
        "company": "Sample Corp",
        "address": "Sample Street 123",
        "zip": "1234 AB",
        "city": "Sampletown",
        "country": "Samplecountry"
        //"custom1": "custom value 1",
        //"custom2": "custom value 2",
        //"custom3": "custom value 3"
    },
    // Your recipient
    "client": {
        "company": "Client Corp",
        "address": "Clientstreet 456",
        "zip": "4567 CD",
        "city": "Clientcity",
        "country": "Clientcountry"
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
    },
    "information": {
        // Invoice number
        "number": "2021.0001",
        // Invoice data
        "date": "12-12-2021",
        // Invoice due date
        "due-date": "31-12-2021"
    },
    // The products you would like to see on your invoice
    // Total values are being calculated automatically
    "products": [
      {
        "quantity": 2,
        "description": "Product 1",
        "tax-rate": 6,
        "price": 33.87
    },
    {
        "quantity": 4.1,
        "description": "Product 2",
        "tax-rate": 6,
        "price": 12.34
    },
    {
        "quantity": 4.5678,
        "description": "Product 3",
        "tax-rate": 21,
        "price": 6324.453456
    }
    ],
    // The message you would like to display on the bottom of your invoice
    "bottom-notice": "Kindly pay your invoice within 15 days.",
    // Settings to customize your invoice
    "settings": {
        "currency": "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
        // "tax-notation": "gst", // Defaults to 'vat'
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
    },
    // Translate your invoice to your preferred language
    "translate": {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal" // Defaults to 'Total'
    },
};

  //Create your invoice! Easy!
  let pdfResult = await easyinvoice.createInvoice(data);
  const fileName = `./invoice/invoice${Date.now()}.pdf`;

//   if (ensureDirExistsAndWritable('./invoice') == true) {
//     fs.writeFile(fileName, pdfResult.pdf, (err) => {
//       if (err) throw Error(err);
//       console.log('good');
//     }); 
// }

fs.writeFileSync(fileName, pdfResult.pdf, {encoding: "base64", mode: "0o600"});
});

const convertImgToBase64 = () => {
  const imgPath = path.resolve("src", "ui", "assets", "logo.jpg");

  const jpg = fs.readFileSync(imgPath);

  return Buffer.from(jpg).toString("base64");
}

function ensureDirExistsAndWritable(dir) {
  if (fs.existsSync(dir)) {
      try {
          fs.accessSync(dir, fs.constants.W_OK)
      } catch (e) {
          console.error('Cannot access directory')
          return false
      }
  }
  else {
      try {
          fs.mkdirSync(dir)
      }
      catch (e) {
          if (e.code == 'EACCES') {
              console.log('Cannot create directory')
          }
          else {
              console.log(e.code)
          }
          return false
      }
  }
  return true
}

function createWindow() {
  window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  window.title = "Modern Salon";

  window.loadFile("src/ui/index.html");
  return window;
}

module.exports = {
  createWindow
};
