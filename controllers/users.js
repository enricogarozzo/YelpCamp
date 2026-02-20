const User = require('../models/user');

//render registration form

module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
}

//handle registration
module.exports.register = async (req,res)=>{
    try{
        const {email, username, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user,password);

        //log the user in immediately
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success','Welcome to Yelpcamp');

            //redirect to originally requested page or campgrounds
            const redirectUrl = req.session.returnTo || '/campgrounds';
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        })
       
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
}

module.exports.login =  (req, res) => {
    req.flash('success', 'Welcome back!');

    //redirect to originally requested page or campgrounds
    //ignore the commented out line
    //const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//handle logout

module.exports.logout = (req,res, next)=>{
    req.logout(function (err){
        if(err){
            return next(err);
        }
    });
    req.flash('success', 'Goodbye');
    res.redirect('/campgrounds');
}