const { ipcRenderer } = require("electron");
const electron = require('electron');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

$(() => {
  let activeAction; //Used to manage the edit and delete operation (the action to be carried out, sets on click)
    let activeID; //Used to manage the edit and delete operation (the id of the row that was clicked, sets on click)
    let activeType; //Used to manage the edit and delete operation (the type of the data that was clicked, sets on click)
    
    let productDataTable;
    let branchesDataTable;
    let mappedDataTable;
    let mappingDataTable;

    let productNameToBeMapped;

    const formatTime = (timeStamp, skipTime=false) => {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      let formattedTime = '';
      const day = new Date(Number(timeStamp));
      formattedTime += `${dayNames[day.getDay()]}, ${day.getDate()} of ${monthNames[day.getMonth()]} ${day.getFullYear()}\n`;
      if (!skipTime) {
        const hours = day.getHours() < 10 ? `0${day.getHours()}` : day.getHours();
        const minutes = day.getMinutes() < 10 ? `0${day.getMinutes()}` : day.getMinutes();
        const seconds = day.getSeconds() < 10 ? `0${day.getSeconds()}` : day.getSeconds();
        formattedTime += `${hours}:${minutes}:${seconds}`;
      }
      
      return formattedTime;
    }

    let openSection = (sectionClassName, clickedNavItem) => {
      $('.sections').hide();
      $(`.${sectionClassName}`).show()
      if (clickedNavItem) {
        $('nav li').each((index, elem) => $(elem).removeClass('active'));
        clickedNavItem.addClass('active');
      }
      $('main').removeClass('d-none');
    };

    openSection('home');

    $('nav li').each((index, navItem) => {
      $(navItem).on('click', (event) => {
        if(!$(navItem).hasClass('active')) {
          let sectionName = $(navItem).attr('data-name');
          openSection(sectionName, $(navItem));
        }
      });
    });

    $("#mapProductBtn").on("click", (event) => openSection('map', $(".navToMaps")));

    const addListenersOnRowIcons = () => {
      $("i.fa").each((index, icon) => {
        $(icon).on("click", ev => {
          const elem = $(icon);
          activeAction = elem.attr('data-action');
          activeID = elem.attr('data-id');
          activeType = elem.attr('data-type');

          //Retrieve data and prefill edit form if it is an edit action
          if (activeAction === 'edit') {
            if (activeType === 'product') {
              getProductById(activeID).then(result => {
                $("#productEditForm input").each((index, inputElem) => {
                  Object.keys(result).forEach((value) => {
                    let elemName = $(inputElem).attr('name');
                    if (elemName === value) {
                      inputElem.value = result[value];
                    }
                  });
                });
              });
            }else if (activeType === 'branch') {
              getBranchById(activeID).then(result => {
                $("#branchEditForm input").each((index, inputElem) => {
                  Object.keys(result).forEach((value) => {
                    let elemName = $(inputElem).attr('name');
                    if (elemName === value) {
                      inputElem.value = result[value];
                    }
                  });
                });
              });
            }else if (activeType === 'mapped') {
              getMappedProductById(activeID).then(result => {
                $("#mappingEditForm input").each((index, inputElem) => {
                  Object.keys(result).forEach((value) => {
                    let elemName = $(inputElem).attr('name');
                    if (elemName === value) {
                      inputElem.value = result[value];
                    }
                  });
                  document.getElementById("editSelectBranchToMap").value = result.branch;
                });
              });
            }
          }
        });
      });
    };

    const getMappedProducts = async () => {
      let result = await ipcRenderer.invoke('getMappedProducts');
      return(result);
    };
    
    const getMappedProductById = async (activeID) => {
      let result = await ipcRenderer.invoke('getMappedProductById', activeID);
      return(result);
    };

    const getProducts = async () => {
      let result = await ipcRenderer.invoke('getProducts');
      return(result);
    };

    const getBranchById = async (activeID) => {
      let result = await ipcRenderer.invoke('getBranchById', activeID);
      return(result);
    };

    const getProductById = async (activeID) => {
      let result = await ipcRenderer.invoke('getProductById', activeID);
      return(result);
    };

    const getBranches = async () => {
      let result = await ipcRenderer.invoke('getBranches');
      return(result);
    };

    const getBranchesNames = async () => {
      let result = await ipcRenderer.invoke('getBranchesNames');
      return(result);
    };

    const editProduct = async (id, product) => {
      let result = await ipcRenderer.invoke('updateProduct', id, product);
      console.log(`Product with id of ${id} edited successfully`);
    };

    const deleteProduct = async (id) => {
      let result = await ipcRenderer.invoke('deleteProduct', id);
      productDataTable.clear();
      result.forEach(elem => {
        elem.actionCell = `<td>
        
          <i class="fa fa-solid fa-pen" role="button" data-id="${elem.id}" data-action="edit" data-type="product" data-bs-toggle="modal" data-bs-target="#productEditModal"></i>
          <i class="fa fa-solid fa-trash-can" role="button" data-id="${elem.id}" data-action="delete" data-type="product" data-bs-toggle="modal" data-bs-target="#deleteModal"></i>
        </td>`;
        productDataTable.row.add(elem).draw(false);
      });
      addListenersOnRowIcons();
      console.log(`Product with id of ${id} deleted successfully`);
    };

    const deleteMappedProduct = async (id) => {
      let result = await ipcRenderer.invoke('deleteMappedProduct', id);
    };

    const editBranch = async (id, branch) => {
      let result = await ipcRenderer.invoke('updateBranch', id, branch);
      console.log(`Branch with id of ${id} edited successfully`);
    };

    const deleteBranch = async (id) => {
      let response = await ipcRenderer.invoke('deleteBranch', id);
      branchesDataTable.clear();
      response.forEach(elem => {
        elem.actionCell = `<td>
          <i class="fa fa-solid fa-pen" role="button" data-id="${elem.id}" data-action="edit" data-type="branch" data-bs-toggle="modal" data-bs-target="#branchesEditModal"></i>
          <i class="fa fa-solid fa-trash-can" role="button" data-id="${elem.id}" data-action="delete" data-type="branch" data-bs-toggle="modal" data-bs-target="#deleteModal"></i>
        </td>`;
        branchesDataTable.row.add(elem).draw(false);
      });
      addListenersOnRowIcons();
      console.log(`Branch with id of ${id} deleted successfully`);
    };
    
    const decipherAction = () => {
      if (activeAction === 'edit' && activeType === 'product') editProduct(activeID);
      if (activeAction === 'delete' && activeType === 'product') deleteProduct(activeID);
      if (activeAction === 'edit' && activeType === 'branch') editBranch(activeID);
      if (activeAction === 'delete' && activeType === 'branch') deleteBranch(activeID);
      if (activeAction === 'delete' && activeType === 'mapped') deleteMappedProduct(activeID);
    };

    $("button#deleteModalBtn").on("click", ev => decipherAction()); // Runs the decipherAction function once the proceed button on delete modal has been clicked

    $("#branchFormSubmitBtn").on("click", async (ev) => {
      const branchForm = document.getElementById("branchForm");
      if (branchForm.reportValidity()) {
        const today = (new Date());
        let branchData = {};
        $("#branchForm input").each((index, inputElem) => {
          let elemName = $(inputElem).attr('name');
          let elemValue = inputElem.value;
          branchData[elemName] = elemValue;
        });
        branchData['createdDate'] = today.getTime();
        branchData['updatedDate'] = branchData.createdDate;
        branchData['updatedBy'] = branchData.createdBy;
        let result = await ipcRenderer.invoke('createBranch', branchData);
        branchForm.reset();
        $("#branchesModal").modal('hide');
        result.actionCell = `<td>
          <i class="fa fa-solid fa-pen" role="button" data-id="${result.id}" data-action="edit" data-type="branch" data-bs-toggle="modal" data-bs-target="#branchesEditModal"></i>
          <i class="fa fa-solid fa-trash-can" role="button" data-id="${result.id}" data-action="delete" data-type="branch" data-bs-toggle="modal" data-bs-target="#deleteModal"></i>
        </td>`;
        branchesDataTable.row.add(result).draw(false);
      }
    });

    $("#productFormSubmitBtn").on("click", async (ev) => {
      const productForm = document.getElementById("productForm");
      if (productForm.reportValidity()) {
        const today = (new Date());
        let productData = {};
        $("#productForm input").each((index, inputElem) => {
          let elemName = $(inputElem).attr('name');
          let elemValue = inputElem.value;
          productData[elemName] = elemValue;
        });
        productData['createdDate'] = today.getTime();
        productData['updatedDate'] = productData.createdDate;
        productData['updatedBy'] = productData.createdBy;
        let result = await ipcRenderer.invoke('createProduct', productData);
        productForm.reset();
        $("#productModal").modal('hide');
        result.actionCell = `<td>
          <i class="fa fa-solid fa-pen" role="button" data-id="${result.id}" data-action="edit" data-type="product" data-bs-toggle="modal" data-bs-target="#productEditModal"></i>
          <i class="fa fa-solid fa-trash-can" role="button" data-id="${result.id}" data-action="delete" data-type="product" data-bs-toggle="modal" data-bs-target="#deleteModal"></i>
        </td>`;
        productDataTable.row.add(result).draw(false);
      }
    });

    $("#branchEditFormSubmitBtn").on("click", async (ev) => {
      const branchForm = document.getElementById("branchEditForm");
      if (branchForm.reportValidity()) {
        const today = (new Date());
        let branchData = {};
        $("#branchEditForm input").each((index, inputElem) => {
          let elemName = $(inputElem).attr('name');
          let elemValue = inputElem.value;
          branchData[elemName] = elemValue;
        });
        branchData['updatedDate'] = today.getTime();
        let result = await ipcRenderer.invoke('updateBranch', activeID, branchData);
      }
    });

    $("#productEditFormSubmitBtn").on("click", async (ev) => {
      const productForm = document.getElementById("productEditForm");
      if (productForm.reportValidity()) {
        const today = (new Date());
        let productData = {};
        $("#productEditForm input").each((index, inputElem) => {
          let elemName = $(inputElem).attr('name');
          let elemValue = inputElem.value;
          productData[elemName] = elemValue;
        });
        productData['updatedDate'] = today.getTime();
        let result = await ipcRenderer.invoke('updateProduct', activeID, productData);
      }
    });

    $("#mappingEditModalBtn").on("click", async (ev) => {
      const mappingForm = document.getElementById("mappingEditForm");
      if (mappingForm.reportValidity()) {
        const today = (new Date());
        let mappedData = {};
        $("#mappingEditForm input").each((index, inputElem) => {
          let elemName = $(inputElem).attr('name');
          let elemValue = inputElem.value;
          mappedData[elemName] = elemValue;
        });
        mappedData.branch = document.getElementById("editSelectBranchToMap").value;
        mappedData['totalAmount'] = Math.round(mappedData.unitPrice * mappedData.quantity).toFixed(2);
        mappedData['updatedDate'] = today.getTime();
        let result = await ipcRenderer.invoke('updateMappedProduct', activeID, mappedData);
      }
    });

    getProducts().then(products => {

      console.log(products);
      
      products = products.map((elem) => {
        elem.actionCell = `
          <td>
            <img class="fa" src="./svg/pen.svg" role="button" data-id="${elem.id}" data-action="edit" data-type="product" data-bs-toggle="modal" data-bs-target="#productEditModal">
            <img class="fa trash-can" src="./svg/trash.svg" role="button" data-id="${elem.id}" data-action="delete" data-type="product" data-bs-toggle="modal" data-bs-target="#deleteModal">
          </td>
        `;
        elem.updatedDate = formatTime(elem.updatedDate);
        elem.createdDate = formatTime(elem.createdDate);
        return elem;
      });

      productDataTable = $('#productTable').DataTable( {
        "data": products,
        "aaSorting": [],
        "columns": [
            { "data": "productName" },
            { "data": "productCode" },
            { "data": "productType" },
            { "data": "productPrice" },
            { "data": "quantity" },
            { "data": "updatedBy" },
            { "data": "updatedDate" },
            { "data": "createdBy" },
            { "data": "createdDate" },
            { "data": "actionCell" }
        ],
        "scrollY": 400,
        "scrollX": true,
      });
      addListenersOnRowIcons();
    });

    getBranches().then(branches => {
      
      branches = branches.map((elem) => {
        elem.actionCell = `
          <td>
            <img class="fa" src="./svg/pen.svg" role="button" data-id="${elem.id}" data-action="edit" data-type="branch" data-bs-toggle="modal" data-bs-target="#branchesEditModal">
            <img class="fa trash-can" src="./svg/trash.svg" role="button" data-id="${elem.id}" data-action="delete" data-type="branch" data-bs-toggle="modal" data-bs-target="#deleteModal">
          </td>
        `;
        elem.updatedDate = formatTime(elem.updatedDate);
        elem.createdDate = formatTime(elem.createdDate);
        return elem;
      });

      branchesDataTable = $('#branchesTable').DataTable( {
        "data": branches,
        "aaSorting": [],
        "columns": [
            { "data": "branchName" },
            { "data": "branchCode" },
            { "data": "address" },
            { "data": "contactNumber" },
            { "data": "updatedBy" },
            { "data": "updatedDate" },
            { "data": "createdBy" },
            { "data": "createdDate" },
            { "data": "actionCell" }
        ],
        "scrollY": 400,
        "scrollX": true,
      });
      addListenersOnRowIcons();
    });

    getMappedProducts().then(mappedProducts => {
      
      mappedProducts = mappedProducts.map((elem) => {
        elem.actionCell = `
          <td>
            <img class="fa" src="./svg/pen.svg" role="button" data-id="${elem.id}" data-action="edit" data-type="mapped" data-bs-toggle="modal" data-bs-target="#mappingEditModal">
            <img class="fa trash-can" src="./svg/trash.svg" role="button" data-id="${elem.id}" data-action="delete" data-type="mapped" data-bs-toggle="modal" data-bs-target="#deleteModal">
          </td>
        `;
        elem.updatedDate = formatTime(elem.updatedDate);
        elem.createdDate = formatTime(elem.createdDate);
        elem.mapDate = formatTime(elem.mapDate);
        return elem;
      });

      mappedDataTable = $('#homeTable').DataTable( {
        "data": mappedProducts,
        "aaSorting": [],
        "columns": [
            { "data": "product" },
            { "data": "branch" },
            { "data": "mapDate" },
            { "data": "unitPrice" },
            { "data": "quantity" },
            { "data": "totalAmount" },
            { "data": "updatedBy" },
            { "data": "updatedDate" },
            { "data": "createdBy" },
            { "data": "createdDate" },
            { "data": "actionCell" }
        ],
        "scrollY": 400,
        "scrollX": true,
      });
      addListenersOnRowIcons();
    });

    getProducts().then(products => {
      products = products.filter((elem) => {
        if (elem.mapped == 0) {
          elem.branchName = '---';
          elem.actionCell = `
            <td>
              <button data-price="${elem.productPrice}" data-name="${elem.productName}" class="changeMappingBtn" data-bs-toggle="modal" data-bs-target="#mappingModal">change mapping</button>
            </td>
          `;
          elem.updatedDate = formatTime(elem.updatedDate);
          // elem.createdDate = formatTime(elem.createdDate);
          return elem;
        }
      });

      mappingDataTable = $('#mappingTable').DataTable( {
        "data": products,
        "aaSorting": [],
        "columns": [
            { "data": "productName" },
            { "data": "branchName" },
            { "data": "updatedDate" },
            { "data": "actionCell" }
        ]
      });
    }).then(() => {
      $('.changeMappingBtn').each((index, btnElem) => {
        $(btnElem).on("click", (ev) => {
          // productNameToBeMapped = 
          document.getElementById("productToMap").value = $(btnElem).attr('data-name');
          document.getElementById("unitPrice").value = $(btnElem).attr('data-price');
        });
      });
    });

    getBranchesNames().then(results => {
      results.forEach((value) => {
        $("#selectBranchToMap").append(`<option value="${value.branchName}">${value.branchName}</option>`);
        $("#editSelectBranchToMap").append(`<option value="${value.branchName}">${value.branchName}</option>`);
      })
    });

    $("#mappingModalBtn").on("click", async (ev) => {
      const mappingForm = document.getElementById("mappingForm");
      if(mappingForm.reportValidity()) {
        const today = (new Date());
        let mappingData = {};
        $("#mappingForm input").each((index, inputElem) => {
          let elemName = $(inputElem).attr('name');
          let elemValue = inputElem.value;
          mappingData[elemName] = elemValue;
        });
        mappingData['branch'] = $("#selectBranchToMap").val();
        mappingData['createdDate'] = today.getTime();
        mappingData['updatedDate'] = mappingData.createdDate;
        mappingData['mapDate'] = mappingData.createdDate;
        mappingData['updatedBy'] = mappingData.createdBy;
        mappingData['totalAmount'] = Math.round(mappingData.unitPrice * mappingData.quantity).toFixed(2);
        console.log(mappingData);
        let result = await ipcRenderer.invoke('mapProductToBranch', mappingData);
        mappingForm.reset();
        $("#mappingModal").modal('hide');
      };
    });

  $("#map_date").on('change', (ev) => {
    const day = new Date($('#map_date').val()).getTime();
    $("#homeTable_filter input").val(day ? formatTime(day, true) : ''); //This changes the value of the input field responsible for the search function
    $("#homeTable_filter input").trigger('keyup');  //trigger keyup event to initiate search action
  });

  $("#printBtn").on("click", (ev) => {
    const doc = new jsPDF(
      {
        orientation: "landscape",
      }
    );
    
    doc.autoTable({ html: '#homeTable' });

    doc.save('report.pdf');
    console.log('done');
    
  });

//   const BrowserWindow = electron.remote.BrowserWindow;
  
// var convert = document.getElementById('convert');
// var filepath2 = path.join(__dirname, '../assets/print2.pdf'); 
  
// var options2 = {
//     marginsType: 1,
//     pageSize: 'A4',
//     printBackground: true,
//     printSelectionOnly: false,
//     landscape: false
// }
  
// convert.addEventListener('click', (event) => {
//     let win = new BrowserWindow({
//         show: false,
//         webPreferences: {
//           nodeIntegration: true
//         }
//       });
  
//     win.loadURL('https://www.google.com/');
  
//     win.webContents.on('did-finish-load', () => {
//         win.webContents.printToPDF(options2).then(data => {
//             fs.writeFile(filepath2, data, function (err) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log('PDF Generated Successfully');
//                 }
//             });
//         }).catch(error => {
//             console.log(error)
//         });
//     });
// });

    // $("#homeTable").DataTable();

    // getProducts().then(products => {
      
    //   let productRowMockUp = '';
    //   products.forEach((elem) => {
    //     productRowMockUp += `
    //     <tr>
    //       <td>${elem.productName}</td>
    //       <td>${elem.productCode}</td>
    //       <td>${elem.productType}</td>
    //       <td>
    //         <i class="fa fa-solid fa-pen" role="button" data-id="${elem.id}" data-action="edit" data-type="product" data-bs-toggle="modal" data-bs-target="#editModal"></i>
    //         <i class="fa fa-solid fa-trash-can" role="button" data-id="${elem.id}" data-action="delete" data-type="product" data-bs-toggle="modal" data-bs-target="#deleteModal"></i>
    //       </td>
    //     </tr>
    //     `;
    //   });
    //   $("#productTable tbody").append(productRowMockUp);
    // });
});

module.exports = {};
