var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "",
	database: "Bamazon"
});

connection.connect(function(err){
	if(err) {
		console.log(err);
	} else{
		console.log("connected as id " + connection.threadId);
	}
});

var managerView = function() {
    
    // prompts the user for what action they should take
    inquirer.prompt({
        name: "menuItem",
        type: "list",
        message: "Action to be performed",
        choices : ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product"]
    }).then(function(answer) {
        // based on their answer,call the different functions
        if (answer.menuItem === "View Products for Sale") {
            viewProduct();
        }
        else if(answer.menuItem === "View Low Inventory"){
            viewLowInventory();
        } else if(answer.menuItem === "Add to Inventory"){
            addInventory();
        } else{
            addNewProduct();
        }
    });
};

// run the managerView function when the file is loaded to prompt the user
managerView();

// function to view the product in the inventory.
function viewProduct(){
    // query the database for all items being sold
    var query = "SELECT item_id, product_name,department_name,price,Stock_quantity FROM products";

    console.log("Products for Sale in Bamazon:");
    connection.query(query,function(err, res) {
        if (err) throw err;
 
        // instantiate the table 
        var table = new Table({
            head: ['item_id', 'product_name','department_name','price','Stock_quantity'],
            colWidths: [20,40,20,20,20,20]
        });
        
        for (var i = 0; i < res.length; i++) {
            //pushing the res into the table array.
            table.push(
                [res[i].item_id,res[i].product_name,res[i].department_name,res[i].price,res[i].Stock_quantity]
            );
        }; 
        console.log(table.toString());   
    }); 
};


function viewLowInventory(){
    // query the database for all products where stock quantity is less than 5 
    var sqlStatement = "select * from products WHERE Stock_quantity < ?";

    connection.query(sqlStatement,[5],function(err, res) {
        if (err) throw err;
        console.log("Currently we have Low Inventory for these items:");
        // instantiate the table 
        var table = new Table({
            head: ['item_id', 'product_name','department_name','price','Stock_quantity'],
            colWidths: [20,40,20,20,20,20]
        });
        
        for (var i = 0; i < res.length; i++) {
            //pushing the res into the table array.
            table.push(
                [res[i].item_id,res[i].product_name,res[i].department_name,res[i].price,res[i].Stock_quantity]
            );
        }; 
        console.log(table.toString());   
    });  
};

function addInventory(){
    // query the database for all product being sold 
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // get the information of the chosen item
        var choiceArray = [];
        for (var i = 0; i < res.length; i++) {
            choiceArray.push(res[i].product_name);
        }
        console.log("Choice Array"+ choiceArray);
        console.log("Add Inventory to Bamazon:");
         // prompts the manager for what product they want to add to inventory  
        inquirer.prompt([
          {
            name: "updateInventory",
            type: "list",
            choices: choiceArray,
            message: "Add more in the current inventory"
          },
          {
            name: "quantity",
            type: "input",
            message: "How much do you want to add this item in the inventory ?",
            validate: function(value) {
                            if (isNaN(value) === false) {
                                return true;
                            }
                            return false;
            }
        }]).then(function(answer) {

            // get the information of the chosen item
            var chosenItem;
              for (var i = 0; i < res.length; i++) {
                //console.log(res[i].product_name)
                if (res[i].product_name === answer.updateInventory) {
                  chosenItem = res[i];
                }
              }

            var updatedItem = answer.updateInventory;
            var updatedQuantity = parseInt(answer.quantity) + parseInt(chosenItem.Stock_quantity);
            //console.log(updatedQuantity);

            // update the database with new stock added to the inventory 
            var sqlStatement = "UPDATE products SET Stock_quantity= @updatedQuantity WHERE product_name = @updatedItem";

            connection.query(sqlStatement, function(error,response){
                if(error) {
                    console.log(error);
                } else{
                    console.log("Updated the inventory for "+answer.updateInventory+"!!");
                }
            });
        }); 
    });
};

function addNewProduct(){
    // query the database for all items being auctioned
    connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
        console.log("Add New Product in Bamazon inventory:");
        // prompt the manager to give the product details being added  
        inquirer.prompt([
          {
            name: "addNew",
            type: "input",
            message: "Name the product which you want to add"
          },
          {
            name: "department_name",
            type: "input",
            message: "Which department should the product be added to?"
          },
          {
            name: "price",
            type: "input",
            message: "What is price (cost to customer) of the new product?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
          },
          {
            name: "quantity",
            type: "input",
            message: "What is the number of stock of the product which you added?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
          },
          {
            name: "product_sales",
            type: "input",
            message: "What is the sales of the product which you added?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
          }
        ]).then(function(answer) {
        console.log(answer);

        var sqlStatement = "INSERT INTO products SET?";
        connection.query(sqlStatement, {
                product_name: answer.addNew,
                department_name: answer.department_name,
                price: answer.price,
                Stock_quantity: answer.quantity,
                product_sales: answer.product_sales
            }, function(err) {
                if (err) throw err;
                console.log("You just added "+ answer.addNew +" to the inventory")
            })
        }); 
    });
};



