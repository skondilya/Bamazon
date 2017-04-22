//dependency for inquirer npm package and mysql package 
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

//create the connection information for the sql database
var connection = mysql.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "shreya@1234",
	database: "Bamazon"
});

//connect to the mysql server and sql database
connection.connect(function(err){
	if(err) {
		console.log(err);
	} else{
		console.log("connected as id " + connection.threadId);
	}
});

var buyingItem = function() {
    // query the database for all items being sold
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.log("Items for Sale in Bamazon:");
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

        // prompts the user for what product they want to buy 
        inquirer.prompt([
        {
            name: "buyingItemID",
            type: "input",
            message: "Which Item do you wish to buy? Please provide the ID of the product."
        }, 
        {
            name: "buyingItemUnit",
            type: "input",
            message: "How many units of the product you would like to buy?"
        }
        ]).then(function(answer) {
    	  //console.log(answer);
          // get the information of the chosen item
          var chosenItem;
          for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id)
            if (res[i].item_id === parseInt(answer.buyingItemID)) {
              chosenItem = res[i];
            }
          }
          //console.log(chosenItem);

          //determine if item unit was higher than the stock quantity 
          if (chosenItem.Stock_quantity > parseInt(answer.buyingItemUnit)) {
        
            var sqlStatement = "UPDATE products SET Stock_quantity = Stock_quantity - ? WHERE item_id = ?";
            connection.query(sqlStatement,[answer.buyingItemUnit, answer.buyingItemUnit, chosenItem.item_id],function(error,response){
                if(error) {
                    console.log(error);
                } else{
                    // the total the cost to pay
                    var cost = answer.buyingItemUnit * chosenItem.price; 
                    //department name of the chosen item
                    var department = chosenItem.department_name; 
                    var sqlDepartment = "UPDATE departments SET total_sales = total_sales + ? WHERE department_name = ?";
                    //do another connection query to update the departments table with the total sales made
                    connection.query(sqlDepartment, [cost,department], function(error, response) {
                        if (error) {

                        } else {
                            console.log("Your order for "+ chosenItem.product_name+" ("+ answer.buyingItemUnit + " units) was placed successfully!");
                            console.log("Your total bill is $" + cost); 
                        }
                    });
                        
                    }
            }); 
          }
          else {
            // stock quantity wasn't high enough
            console.log("Sorry,Insufficient quantity of " + chosenItem.product_name + " currently in our stock!");
          }
        });
    });

};


// run the start function when the file is loaded to prompt the user
buyingItem();
