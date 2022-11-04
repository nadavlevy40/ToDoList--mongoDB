//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const app = express();  
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-nadav:Mta159874123@cluster0.knjtof1.mongodb.net/todolistDB");

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);


const firstItem=new Item({
  name:"First item"
});

const secondItem=new Item({
  name:"Secon item"
})

const defaultItems=[firstItem , secondItem];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List", listSchema);


app.get("/", function(req, res) {

   Item.find({},function(err,foundItems){
     if(foundItems.length==0)
     {
      Item.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }
        else{
          console.log("succesefuly inseted");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list",{listTitle:"Today",newListItems:foundItems});
   }
   
});
});

   // Item.find({},function(err,foundItems){
  //   if(foundItems.length==0){
  //     Item.insertMany(defaultItems,function(err){
  //     res.redirect("/");
  //     });
  //   }
  
  //   else
  //   {
   // res.render("list", {listTitle: "Today", newListItems:foundItems})  ;

  //   }
   // });
  // });
  //     Item.insertMany(defaultItems,function(err){
  //       if(err)
  //       {
  //          console.log(err);
  //       }
  //       else
  //       {
  //          console.log("successfuly inseted to document!");
  //       }
  //     });
  //       res.redirect("/");
  //   }
    // else{
    //   if(err)
    //   {
    //     console.log(err);
    //   }
    //   else{
    //   res.render("list", {listTitle: "Today", newListItems:foundItems})  ;
    //   }
    // });
    // }

  // });
// });





app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const listName=req.body.list;

  const item=new Item({
    name:itemName    

  });

  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })

  }
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName=="Today")
  {
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Delete succsseful!");
         res.redirect("/");
  }

  });
 }
else
{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
    res.redirect("/" + listName);
    }
  });
}
  
  
}); 

app.get("/:customListName",function(req,res){
  const customList=_.capitalize(req.params.customListName);
  
  List.findOne({name:customList},function(err,foundList) {
      if(!err)
      {
        if(!foundList)
        //create a new list!
        {
          const list=new List({
            name:customList,
            items:defaultItems
          });
          list.save();
          res.redirect("/" +  customList);

        }
        else{
          //show an existing list!
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
      }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfuly!");
});

// const server = app.listen(process.env.PORT || 3000, () => {
//   const port = server.address().port;

// });