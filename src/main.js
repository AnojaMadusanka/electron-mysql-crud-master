const { BrowserWindow, Notification, ipcMain } = require("electron");
const { getConnection } = require("./database");

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
  const results = await conn.query("SELECT p.quantity, mp.* From product p INNER JOIN mapped_product mp ON p.productName = mp.product;");
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

// ipcMain.handle('printReport', (ev, htmlContent) => {
//   const doc = new jsPDF({
//     orientation: "landscape",
//   });
  
//   doc.autoTable({ html: '#homeTable' });

//   doc.save('report.pdf');
// });

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
