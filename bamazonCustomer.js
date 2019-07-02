var mysql = require("mysql");
var Table = require("cli-table");
var inquirer = require("inquirer");
var choices = [];
var quantity;
var quantityRequested;
var id;
var price;
var status = false;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "enterHere",
    database: "bamazon_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(`Connected at ID: ${connection.threadId}`)
    showStock();
});

function showStock() {
    connection.query(
        `select position, name, department, price, stock from products`, function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                var item = {
                    position: res[i].position,
                    name: res[i].name,
                    department: res[i].department,
                    price: res[i].price,
                    stock: res[i].stock
                }
                choices.push(item)
            };
            //console.log(choices)
            var table = new Table({
                head: ["Position", "Name", "Department", "Price", "Stock"],
                colWidths: [10, 20, 20, 10, 10]
            });
            //console.log(nameSong);
            for (var i = 0; i < res.length; i++) {
                products = res[i];
                table.push([`${products.position}`, `${products.name}`, `${products.department}`, `${products.price}`, `${products.stock}`]);
            }
            console.log(table.toString());
            if (status === false) {
                console.log(`
Welcome to Bamazon! We have a wide variety of things to buy. 
Go ahead and find an item you like, enter its ID, and enter the quantity you would like to buy. 
Enjoy!`)
            }
            start();
        },
    )
}

function start() {
    inquirer.prompt([
        {
            type: "input",
            message: "What ID?",
            name: "idInput"
        }
    ]).then(function (response) {
        id = response.idInput;
        connection.query(
            `select * from products where position = "${id}"`, function (err, response) {
                if (err) throw err;
                quantity = response[0].stock;
                price = response[0].price;
                requestQuantity();
            }
        )
    })
}

function requestQuantity() {
    inquirer.prompt([
        {
            type: "input",
            message: "How many would you like?",
            name: "quantity"
        }
    ]).then(function (response) {
        var quantityRequested = response.quantity;
        var newStock = quantity - quantityRequested;
        var total = quantityRequested * price;
        status = true;
        if (quantityRequested > quantity) {
            console.log("Please try again! We don't have that many at this time!")
            keepShopping();
        }
        else {
            connection.query(
                `update products set stock = ${newStock} where position = ${id}`, function (err, response) {
                    if (err) throw err;
                    console.log(`Your total is $${total}`);
                    keepShopping();
                }
            )
        }
    })

}

function keepShopping() {
    inquirer.prompt([
        {
            type: "confirm",
            message: "Would you like to keep shopping?",
            name: "check",
            default: true
        }
    ]).then(function (response) {
        if (response.check) {
            showStock();
        }
        else {
            console.log("Thank you for shopping with us!");
            connection.end();
        }
    })
}