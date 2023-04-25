const emailValidator = require('email-validator');
const fetch = require('node-fetch')
const nodemailer = require('nodemailer');
const portfolioController = {
    sendEmail: async (req, res) => {
        try {
        if(!req?.body?.mail || !req?.body?.subject || !req?.body?.text || !emailValidator.validate(req?.body?.mail)) {
            return res.status(200).json({
                error: 'Veuillez vérifier ce que vous avez saisis.'
            })
        } else {
            let recaptcha_success = false;
            await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY_PORTFOLIO}&response=${req?.body?.recaptcha}`, { method: 'POST'}
          ).then(res => res.json()).then(res => {
            if(res.success) {
              recaptcha_success = true;
              return res ;
            }
            });
            if(recaptcha_success) {
                async function main() {
                    let transporter = nodemailer.createTransport({
                      host: process.env.SMTP_HOST,
                      port: process.env.SMTP_PORT,
                      secure: false,
                      auth: {
                        user: process.env.SMTP_MAIL,
                        pass: process.env.SMTP_PASS,
                      },
                    });
                    let info = await transporter.sendMail({
                      from: `"Portfolio" <${process.env.SMTP_MAIL}>`,
                      to: process.env.ADMIN_EMAIL,
                      subject: req.body.subject,
                      html: `${req.body.text} <br> FROM : ${req.body.mail}` // html body
                    });
                  }
                  
                  main().catch((e) => console.error(e));
                  return res.status(201).json({success: 'Votre message a bien été envoyé.'});
            } else {
                return res.status(200).json({
                    error: 'Captcha Invalide.'
                })
            }
            }
        } catch(e) {
            return res.status(200).json({
                error: 'Un problème est survenu.'
            })
        }
    }
}
module.exports = portfolioController;