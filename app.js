const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://jmangondato02:Myra1986@cluster0.kdypku2.mongodb.net/todolistDB");

const itemsSchema={
    name: String
};

const Item=mongoose.model("Item", itemsSchema);

const item1=new Item({
    name:"Welcome to your To-Do List"
})

const item2=new Item({
    name: "Hit the + button to off a new item."
})

const item3= new Item({
    name:"<---Hit this to delete an item."
})

const defaultItems =[item1,item2,item3];

const listSchema={
    name: String,
    items: [itemsSchema]
};

const List= mongoose.model("List",listSchema);
   
app.use(express.static("public"));


app.get("/", async function(req, res){
const foundItems=await Item.find({});

if(!(await Item.exists())){
    await Item.insertMany(defaultItems);
    res.redirect("/");
}else{
 res.render("List", {
listTitle:"To-Do List", newListItems: foundItems});
}
 });

app.get("/:customListName",async function (req,res){
    const customListName= _.capitalize(req.params.customListName);
    const foundList= await List.findOne({name: customListName});

if(!foundList){
 const list = new List({
  name: customListName,
  items:defaultItems,
});
await list.save();
 res.redirect("/"+ customListName);

}else{
 res.render("list",{listTitle:foundList.name,newListItems:foundList.items});  
}
});

app.post("/", async function(req, res){
 const itemName=req.body.newItem;
 const listName=req.body.list;

console.log("the list name is" + listName);

const item = new Item ({
 name: itemName,
});

if(listName ==="To-Do List"){
  try{
  await item.save();
  console.log("New item has been added to the database:"+itemName);
 
  res.redirect("/");

}catch(error){
    console.log("Error fail adding new item to database",error);
 }
}else{
   const foundList= await List.findOne({name:listName});
   if(!foundList){
    console.log("List ${listName} not found");
    console.log("the list name is:" + listName);
}

try{
 foundList.items.push(item);
 foundList.save();
 
 console.log("New item has been to the database:"+ itemName);
 
 res.redirect("/"+ listName);

}catch(error){
 console.log("Error fail adding new item to database:",error);
 }
  }
 });

app.post("/delete",async function(req,res){

 const checkedItemId=req.body.checkbox;

 console.log(checkedItemId);
 
 const listName=req.body.listName;

if(listName ==="To-Do List" && checkedItemId !=undefined){
 await Item.findByIdAndRemove(checkedItemId);
 
 res.redirect("/");

}else{
 await List.findOneAndUpdate({name:listName},
 {$pull:{items:{_id:checkedItemId}}});
 
  console.log("deleted ${checkedItemId}Successfully");
   res.redirect("/" + listName);
}  
});
let port = process.env.PORT;
if(port == null || port == ""){
    port=3000;
}

app.listen(port, function(){
    console.log("Server started success");
});