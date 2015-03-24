'use strict';

module.exports = {
    forgot_password_email: function(user, req, token, mailOptions) {
        mailOptions.html = [
            '<p>Hi, <strong>' + user.name + '</strong>!</p>',
            '<p>We have received a request to reset the password for your account.</p>',
            '<p>If you made this request, please click on the link below or paste this into your browser to complete the process:</p>',
            '<p><ul type="square"><li><a href="https://acrm.mapqo.com/#!/reset/' + token + '">https://acrm.mapqo.com/#!/reset/' + token + '</a></li></ul>',
            '<p>This link will work for 1 hour or until your password is reset.</p>',
            '<p>If you did not ask to change your password, please ignore this email and your account will remain unchanged.</p>'
        ].join('\n\n');
        mailOptions.subject = 'Resetting the password';
        return mailOptions;
    }
};
