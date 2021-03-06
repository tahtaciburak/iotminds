var utilities = require("./utilities.js")

// app/routes.js
module.exports = function(app, passport) {
	var db = require('../config/db.js')
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		if(!req.isAuthenticated()){
			res.render('index.ejs'); // load the index.ejs file
		}else{
			res.redirect('/profile')
		}
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}))

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		utilities.getChannels(req.user.id, function(err, result) {
            if (err)
                return err

            res.render('profile.ejs', {
                user: req.user,
                channels: result
            })
        })
	})

	app.get('/channels/:channel_id',function (req,res) {
	var channel_id = req.params.channel_id
	var name
	var data

	db.query("SELECT * FROM channels WHERE id=?",[channel_id],function (err,result) { 
		if(err)
			return utilities.printError(res, err)

		if(!result || result.length == 0)
			return utilities.printError(res, "No such channel")

		name=result[0].name
		created_at=result[0].created_at

		utilities.getComponents(channel_id, function(err, result){
			if (err)
				return utilities.printError(res, err)

			res.render("channel",{
				components : result,
				channel_id : channel_id,
				created_at: created_at,
				channel_name : name,
				data : data
			})
		})
	})
	})

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	app.get("/docs",function (req,res) {
		res.render("documentation")
	})
	/*app.get("/support",function (req,res) {
		res.render("support")
	})*/
	app.get("/*",function (req,res) {
		res.render("404")
	})

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
