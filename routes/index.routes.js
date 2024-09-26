var express = require('express');
var router = express.Router();
var client = require("../util/cache");
const imagekit = require("../util/imagekit")


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Expense Tracker | Homepage',
    user: req.user,
  });
});

router.get("/about", function (req, res, next) {
  res.render("about", {
    title: "Expense Tracker | About",
    user: req.user
  });
});


router.get("/createsession", function (req, res, next) {
  req.session.expenselogin = true;
  res.status(200).json({ message: "Session Created" });
});


router.get("/checksession", function (req, res, next) {
  console.log(req.session);
  if (req.session.expenselogin) {
    res.status(200).json({ message: "Session Active" });
  } else {
    res.status(200).json({ message: "Session Inactive" });
  }
});



router.get("/destroysession", function (req, res, next) {
  req.session.destroy();
  res.status(200).json({ message: "Session Destroyed" });
});


router.get("/createcookie", function (req, res, next) {
  res.cookie("expenselogin", true, {
    maxAge: 20000,
    secure: true,
    httpOnly: true,
  });
  res.status(200).json({ message: "Cookie Created" });
});



router.get("/checkcookie", function (req, res, next) {
  console.log(req.cookies);
  if (req.cookies.expenselogin) {
    res.status(200).json({ message: "Cookie Active" });
  } else {
    res.status(200).json({ message: "Cookie Inactive" });
  }
});


router.get("/destroycookie", function (req, res, next) {
  res.clearCookie("expenselogin");
  res.status(200).json({ message: "Cookie Destroyed" });
});


router.get("/createflash", function (req, res, next) {
  req.flash("info", "Flash Message Created");
  res.status(200).json({ message: "Flash Message Created" });
});


router.get("/checkflash", function (req, res, next) {
  console.log(req.flash());
  res.status(200).json({ message: "Flash Message Checked" });
});


router.get("/destroyflash", function (req, res, next) {
  req.flash("info");
  res.status(200).json({ message: "Flash Message Destroyed" });
});

router.post("/createcache",(req,res,next) =>{
  client.set("user:profile:123456", 
    JSON.stringify("important data")
  );
  res.status(200).json({message:"cache created"})
});


router.get("/getcache" ,async(req,res,next) =>{
const data = await client.get('user:profile:123456')
res.status(200).json({
  message: "Cache Retrieved",
  data: JSON.parse(data),
});
})

router.get("/delcache", async(req,res,next) =>{
  await client.del("user:profile:123456")
  res.status(200).json({ message: "Cache Deleted" });

})


router.post("/imagekit", async function (req, res, next) {
  try {
      res.status(200).json({
          message: "Image Uploaded",
          res: req.files[0].avatar,
      });
  } catch (error) {
      next(error);
  }
});

module.exports = router;
