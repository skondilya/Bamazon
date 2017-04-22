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

var supervisorView = function() {
    
    // prompt the user for what they'd like to do
    inquirer.prompt({
        name: "menuItem",
        type: "list",
        message: "Action to be performed",
        choices : ["View Product Sales by Department","Create New Department"]
    }).then(function(answer) {
        // based on their answer, run the two functions
        if (answer.menuItem === "View Product Sales by Department") {
            productForSale();
        }
        else if(answer.menuItem === "Create New Department"){
            createNewDepartment();
        } 
    });
};

function productForSale(){
	// query the database for all items is in the inventory 
    var query = "SELECT * FROM departments";

    connection.query(query,function(err, res) {
        if (err) throw err;
 		console.log("Products by Department in Bamazon:");
        // instantiate the table 
        var table = new Table({
            head: ['department_id','department_name','over_head_costs','product_sales','total_profit'],
            colWidths: [20,20,20,20,20]
        });
        
        for (var i = 0; i < res.length; i++) {
            //pushing the res into the table array.
            table.push(
                [res[i].item_id,res[i].department_name,res[i].over_head_costs,res[i].total_sales,(res[i].total_sales-res[i].over_head_costs)]
            );
        }; 
        console.log(table.toString());   
    }); 
};

function createNewDepartment(){
	console.log("Create a New Department in Bamazon:")
	inquirer.prompt([{
            name: "department_name",
            type: "input",
            message: "What is the department name which you want to add?"
        },
        {
            name: "over_head_costs",
            type: "input",
            message: "What is the overhead costs of the department?",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
        name: "total_sales",
        type: "input",
        message: "What is the total sales of the department?",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
        }
    ]).then(function(res) {
        var query = "INSERT INTO departments SET ?";
        //connection with the department table. adding the new department info
        connection.query(query, {
            department_name: res.department_name,
            over_head_costs: res.over_head_costs,
            total_sales: res.total_sales
        }, function(err) {
            if (err) throw err;
            console.log(`You have added the new department`);
        })
    })
};

supervisorView();


