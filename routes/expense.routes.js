var express = require('express');
var router = express.Router();
const ExpenseSchema = require("../models/expense.schema")
const { isLoggedIn } = require('../middlewares/auth.middleware')

router.get("/create", isLoggedIn,(req, res) => {
  res.render("createexpense", {
    title: "Expense Tracker || Create Expense",
    user: req.user,
  })
})

router.post("/create", isLoggedIn,async (req, res, next) => {
  try {
    const newexpense = await new ExpenseSchema(req.body)
    await newexpense.save();
    res.redirect("/expense/show")
  } catch (error) {
    next(error)
  }
})


router.get("/show", isLoggedIn,async  (req, res, next) => {
  try {
    const expenses = await ExpenseSchema.find();
    res.render("showexpense", {
      title: "Expense Tracker | Watch Expense",
      expenses: expenses,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/details/:id",isLoggedIn,  async (req, res, next) => {
  try {
    const expense = await ExpenseSchema.findById(req.params.id);
    res.render("showexpensedetails", {
      title: "Expense Tracker | Expense Details",
      expense: expense,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/delete/:id", isLoggedIn , async (req, res, next) => {
  try {
    await ExpenseSchema.findByIdAndDelete(req.params.id);
    res.redirect("/expense/show");
  } catch (error) {
    next(error);
  }
});

router.get("/update/:id", isLoggedIn , async (req, res, next) => {
  try {
    const expense = await ExpenseSchema.findById(req.params.id);
    res.render("updateexpense", {
      title: "Expense Tracker | Update Expense",
      expense: expense,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/update/:id", isLoggedIn, async  (req, res, next) => {
  try {
    await ExpenseSchema.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/expense/details/" + req.params.id);
  } catch (error) {
    next(error);
  }
});
module.exports = router;