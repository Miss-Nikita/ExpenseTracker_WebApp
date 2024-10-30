var express = require('express');
var router = express.Router();
const UserSchema = require('../models/user.schema.js')
const imagekit = require("../util/imagekit")

const client = require('../util/cache.js')

const { isLoggedIn } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multimedia.middleware")
const fs = require("fs")


const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const sendEmail = require("../config/email")
const path = require("path")


passport.use(new LocalStrategy(UserSchema.authenticate()));
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/user/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // Here you can save the user profile to your database
      return done(null, profile);
    }
  )
);



router.get("/signup", async (req, res) => {
  res.render("signupuser", {
    title: "Expense Tracker | Signup",
    user: req.user,
  });
});

router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    await UserSchema.register({ username, email }, password);
    res.redirect("/user/signin");
  } catch (error) {
    next(error);
  }
});


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  "/auth/google/callback",
  (req, res, next) => {
    
    console.log("req => ", req.query);
    return next();
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res, next) => {
    const isUserAlreadyExist = await UserSchema.findOne({
      email: req.user.emails[0].value,
    });

    if (isUserAlreadyExist) {
      req.login(isUserAlreadyExist, (err) => {
        if (err) {
          return next(err);
        }
      });
      return res.redirect("/user/profile");
    }

    const newUser = await UserSchema.create({
      username: req.user.displayName,
      email: req.user.emails[0].value,
      avatar: req.user.photos[0].value,
    });

    await newUser.save();
    console.log(newUser);

    req.login(newUser, (err) => {
      if (err) {
        return next(err);
      }
    });

    res.redirect("/user/profile");
  }
);






router.get("/signin", async (req, res) => {
  res.render("signinuser", {
    title: "Expense Tracker | Signin",
    user: req.user,
  });
});


router.post("/signin", passport.authenticate("local"), async (req, res, next) => {
  try {
    req.flash("success", "Successfully LoggedIn!");
    res.redirect("/user/profile");
  } catch (error) {
    console.log(error);
    next(error);
    // res.redirect("/user/signin");
  }
});


// router.post(
//   "/signin",
//   passport.authenticate("local", {
//     successRedirect: "/user/profile",
//     failureRedirect: "/user/signin",
//   }),
//   (req, res) => { }
// );

router.get("/profile", isLoggedIn, async (req, res, next) => {
  try {
    const messages = req.flash();  // Get all flash messages
    let user;

    if (req.user.emails) {
      user = await UserSchema.findOne({ email: req.user.emails[0].value });
    } else {
      user = req.user;
    }

    res.render("profileuser", {
      title: "Expense Tracker | Profile Page",
      user,
      messages  // Pass all messages to the view
    });

    console.log(req.user);
  } catch (error) {
    next(error);
  }
});



router.get("/signout", isLoggedIn, async (req, res) => {
  req.logout(() => {
    res.redirect("/user/signin");
  });
});



router.get("/reset-password", isLoggedIn, async (req, res) => {
  res.render("resetpassworduser", {
    title: "Expense Tracker | Reset Password",
    user: req.user,
  });
});












// Handle password reset
router.post('/reset-password', isLoggedIn, async (req, res) => {
  try {
      const { oldpassword, newpassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
          req.flash('error', 'User not found');
          return res.redirect('/user/profile');
      }


      // Verify old password
      const isValidPassword = await bcrypt.compare(oldpassword, user.password);
      if (!isValidPassword) {
          req.flash('error', 'Current password is incorrect');
          return res.redirect('/user/reset-password');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newpassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      req.flash('success', 'Password updated successfully');
      res.redirect('/user/profile');

  } catch (error) {
      console.error('Password reset error:', error);
      req.flash('error', 'Failed to reset password');
      res.redirect('/user/reset-password');
  }
});

















// this is the main code 

// router.post("/reset-password", isLoggedIn, async (req, res, next) => {
//   try {
//     await req.user.changePassword(
//       req.body.oldpassword,
//       req.body.newpassword
//     );
//     await req.user.save();
//     res.redirect("/user/profile");
//   } catch (error) {
//     next(error);
//   }
// });


router.get("/delete-account", isLoggedIn, async (req, res, next) => {
  try {
    // await UserSchema.findByIdAndDelete(req.user._id);
    // code to delete profile pic


    console.log("about to delete user");

    const user = await UserSchema.findByIdAndDelete(req.user._id);

    console.log("user deleted");

    // if (user.avatar.url != "public/images/default.jpg") {
    //   fs.unlinkSync( path.join(__dirname, user.avatar.url));
    // }

  

    // code to delete all relaated expenses
    res.redirect("/user/signin");
  } catch (error) {
    next(error);
  }
});


router.get("/update", isLoggedIn, async (req, res) => {
  res.render("updateuser", {
    title: "Expense Tracker | Update User",
    user: req.user,
  });
});


router.post("/update", isLoggedIn, async (req, res, next) => {
  try {
    await UserSchema.findByIdAndUpdate(req.user._id, req.body);
    res.redirect("/user/profile");
  } catch (error) {
    next(error);
  }
});




router.post("/avatar", isLoggedIn, async (req, res, next) => {
  // console.log(req.files);

  try {

      if (req.user.avatar.fileId) {
          await imagekit.deleteFile(req.user.avatar.fileId);
      }

      const result = await imagekit.upload({
          file: req.files.avatar.data,
          fileName: req.files.avatar.name,
      });

      // console.log(result);
      // res.json(result);

      // req.user.avatar = result.url;
      // await req.user.save();
      // res.redirect("/user/update");

      const { fileId, url, thumbnailUrl } = result;
      req.user.avatar = { fileId, url, thumbnailUrl };
      // await req.user.save();
      res.redirect("/user/update");


  } catch (error) {
      next(error);
  }
});





// router.post("/avatar", isLoggedIn, async (req, res, next) => {
//   console.log(req.files);
//   try {
//       const result = await imagekit.upload({
//           file: req.files.avatar.data,
//           fileName: req.files.avatar.name,
//       });
//       console.log(result);
//       res.json(result);
//       // req.user.avatar = result.url;
//       // await req.user.save();
//       // res.redirect("/user/update");
//   } catch (error) {
//       next(error);
//   }
// });




router.get("/forget-password", async (req, res) => {
  res.render("forgetpassword_email", {
    title: "Expense Tracker | Forget Password",
    user: req.user,
  });
});



router.post("/forget-password", async (req, res, next) => {
  try {
    console.log(req.body.email)
      const user = await UserSchema.findOne({ email: req.body.email });
      console.log(user)

      if (!user) return next(new Error("User not found!"));

    const otp=Math.round(Math.random()*10000);
           // send email to user with otp
    sendEmail(
      user.email,
      'welcome to m11-server',
      '',
      `<h1>your onetime otp is ${otp}</h1>` );

      // and save the same otp to database
      await client.set("user:otp:1234",JSON.stringify(otp))
      res.redirect(`/user/forget-password/${user._id}`);
  } catch (error) {
      next(error);
  }
});




router.get("/forget-password/:id", async (req, res) => {
  res.render("forgetpassword_otp", {
    title: "Expense Tracker | Forget Password",
    user: req.user,
    id: req.params.id,
  });
});


router.post("/forget-password/:id", async (req, res, next) => {
  try {
      const user = await UserSchema.findById(req.params.id);
      // compare the req.body.otp with the otp in database
      const otp=await client.get("user:otp:1234")
      if(req.body.otp== JSON.parse(otp)){
      // if matched redirect to password page else ERROR
      res.redirect(`/user/set-password/${user._id}`);
  }
  else{
      console.log("invalid otp");
      
    }
  } catch (error) {
      next(error);
  }
});

router.get("/set-password/:id", async (req, res) => {
  res.render("forgetpassword_password", {
    title: "Expense Tracker | Set Password",
    user: req.user,
    id: req.params.id,
  });
});


router.post("/set-password/:id", async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.params.id);
    await user.setPassword(req.body.password);

    user.otp=undefined;

    await user.save();
    res.redirect("/user/signin");
  } catch (error) {
    next(error);
  }
});


module.exports = router;


