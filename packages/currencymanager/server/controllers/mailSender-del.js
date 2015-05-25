// 'use strict';

// var request = require('request'),
//     _ = require('lodash');

// /* jshint ignore:start */
// function ksort(obj) {
//     var keys = Object.keys(obj).sort(),
//         sortedObj = {};

//     for (var i in keys) {
//         sortedObj[keys[i]] = obj[keys[i]];
//     }

//     return sortedObj;
// }

// function md5(str) {

//     var RotateLeft = function(lValue, iShiftBits) {
//         return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
//     };

//     var AddUnsigned = function(lX, lY) {
//         var lX4, lY4, lX8, lY8, lResult;
//         lX8 = (lX & 0x80000000);
//         lY8 = (lY & 0x80000000);
//         lX4 = (lX & 0x40000000);
//         lY4 = (lY & 0x40000000);
//         lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
//         if (lX4 & lY4) {
//             return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
//         }
//         if (lX4 | lY4) {
//             if (lResult & 0x40000000) {
//                 return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
//             } else {
//                 return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
//             }
//         } else {
//             return (lResult ^ lX8 ^ lY8);
//         }
//     };

//     var F = function(x, y, z) {
//         return (x & y) | ((~x) & z);
//     };
//     var G = function(x, y, z) {
//         return (x & z) | (y & (~z));
//     };
//     var H = function(x, y, z) {
//         return (x ^ y ^ z);
//     };
//     var I = function(x, y, z) {
//         return (y ^ (x | (~z)));
//     };

//     var FF = function(a, b, c, d, x, s, ac) {
//         a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
//         return AddUnsigned(RotateLeft(a, s), b);
//     };

//     var GG = function(a, b, c, d, x, s, ac) {
//         a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
//         return AddUnsigned(RotateLeft(a, s), b);
//     };

//     var HH = function(a, b, c, d, x, s, ac) {
//         a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
//         return AddUnsigned(RotateLeft(a, s), b);
//     };

//     var II = function(a, b, c, d, x, s, ac) {
//         a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
//         return AddUnsigned(RotateLeft(a, s), b);
//     };

//     var ConvertToWordArray = function(str) {
//         var lWordCount;
//         var lMessageLength = str.length;
//         var lNumberOfWords_temp1 = lMessageLength + 8;
//         var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
//         var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
//         var lWordArray = Array(lNumberOfWords - 1);
//         var lBytePosition = 0;
//         var lByteCount = 0;
//         while (lByteCount < lMessageLength) {
//             lWordCount = (lByteCount - (lByteCount % 4)) / 4;
//             lBytePosition = (lByteCount % 4) * 8;
//             lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
//             lByteCount++;
//         }
//         lWordCount = (lByteCount - (lByteCount % 4)) / 4;
//         lBytePosition = (lByteCount % 4) * 8;
//         lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
//         lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
//         lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
//         return lWordArray;
//     };

//     var WordToHex = function(lValue) {
//         var WordToHexValue = "",
//             WordToHexValue_temp = "",
//             lByte, lCount;
//         for (lCount = 0; lCount <= 3; lCount++) {
//             lByte = (lValue >>> (lCount * 8)) & 255;
//             WordToHexValue_temp = "0" + lByte.toString(16);
//             WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
//         }
//         return WordToHexValue;
//     };

//     var x = Array();
//     var k, AA, BB, CC, DD, a, b, c, d;
//     var S11 = 7,
//         S12 = 12,
//         S13 = 17,
//         S14 = 22;
//     var S21 = 5,
//         S22 = 9,
//         S23 = 14,
//         S24 = 20;
//     var S31 = 4,
//         S32 = 11,
//         S33 = 16,
//         S34 = 23;
//     var S41 = 6,
//         S42 = 10,
//         S43 = 15,
//         S44 = 21;

//     str = this.utf8_encode(str);
//     x = ConvertToWordArray(str);
//     a = 0x67452301;
//     b = 0xEFCDAB89;
//     c = 0x98BADCFE;
//     d = 0x10325476;

//     for (k = 0; k < x.length; k += 16) {
//         AA = a;
//         BB = b;
//         CC = c;
//         DD = d;
//         a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
//         d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
//         c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
//         b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
//         a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
//         d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
//         c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
//         b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
//         a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
//         d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
//         c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
//         b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
//         a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
//         d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
//         c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
//         b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
//         a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
//         d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
//         c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
//         b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
//         a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
//         d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
//         c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
//         b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
//         a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
//         d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
//         c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
//         b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
//         a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
//         d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
//         c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
//         b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
//         a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
//         d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
//         c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
//         b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
//         a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
//         d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
//         c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
//         b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
//         a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
//         d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
//         c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
//         b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
//         a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
//         d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
//         c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
//         b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
//         a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
//         d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
//         c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
//         b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
//         a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
//         d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
//         c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
//         b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
//         a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
//         d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
//         c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
//         b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
//         a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
//         d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
//         c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
//         b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
//         a = AddUnsigned(a, AA);
//         b = AddUnsigned(b, BB);
//         c = AddUnsigned(c, CC);
//         d = AddUnsigned(d, DD);
//     }

//     var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);

//     return temp.toLowerCase();
// }

// function array_search(needle, haystack, strict) {
//     var strict = !!strict;

//     for (var key in haystack) {
//         if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
//             return key;
//         }
//     }

//     return false;
// }

// function str_replace(search, replace, subject) {
//     if (!(replace instanceof Array)) {
//         replace = new Array(replace);
//         if (search instanceof Array) {
//             while (search.length > replace.length) {
//                 replace[replace.length] = replace[0];
//             }
//         }
//     }

//     if (!(search instanceof Array)) search = new Array(search);
//     while (search.length > replace.length) {
//         replace[replace.length] = '';
//     }

//     if (subject instanceof Array) {
//         for (k in subject) {
//             subject[k] = str_replace(search, replace, subject[k]);
//         }
//         return subject;
//     }

//     for (var k = 0; k < search.length; k++) {
//         var i = subject.indexOf(search[k]);
//         while (i > -1) {
//             subject = subject.replace(search[k], replace[k]);
//             i = subject.indexOf(search[k], i);
//         }
//     }

//     return subject;
// }

// function trim(str, charlist) {
//     charlist = !charlist ? ' \s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
//     var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
//     return str.replace(re, '');
// }


// /* jshint ignore:end */

// function SmtpApi(sPublicKey) {
//     const BASE_URL = 'http://atompark.com/api/smtp/1.0/';
//     const ENC_METHOD = 'aes-128-cbc';

//     this.sPublicKey = '';

//     if (sPublicKey)
//         this.sPublicKey = str_replace('\r\n', '\n', trim(sPublicKey));

//     this.setPublicKey = function(sPublicKey) {
//         if (!sPublicKey)
//             sPublicKey = '';
//         this.sPublicKey = str_replace('\r\n', '\n', trim(sPublicKey));
//     };

//     this.__callApi = function(sData) {
//         if()
//     };

//     this.ping = function() {
//         var sRequest = JSON.stringify({
//             action: 'ping'
//         });
//         return this.__callApi(sRequest);
//     };

//     this.ips = function() {
//         var sRequest = JSON.stringify({
//             action: 'ips';
//         });
//         return this.__callApi(sRequest);
//     };

//     this.domains = function() {
//         var sRequest = JSON.stringify({
//             action: 'domains'
//         });
//         return this.__callApi(sRequest);
//     };

//     this.add_domain = function(sEmail) {
//         if (!sEmail)
//             sEmail = '';
//         var aRequest = {
//             action: 'add_domain',
//             email: sEmail
//         };
//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.verify_domain = function(sEmail) {
//         if (!sEmail)
//             sEmail = '';
//         var aRequest = {
//             action: 'verify_domain',
//             email: sEmail
//         };
//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.sendRaw = function(sEmail) {
//         if (!sEmail)
//             sEmail = '';
//         var aRequest = {
//             action: 'send_raw',
//             data: sEmail
//         };
//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.search = function(aData) {
//         if (!aData)
//             aData = [];
//         if (aData.length > 0) {
//             aRequest.date_from = aData.date_from ? aData.date_from : '';
//             aRequest.date_to = aData.date_to ? aData.date_to : '';
//             aRequest.sender = aData.sender ? aData.sender : '';
//             aRequest.recipient = aData.recipient ? aData.recipient : '';
//         }
//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.info = function(sId) {
//         if (!sId)
//             sId = '';
//         var aRequest = {
//             action: 'info',
//             id: sId
//         };
//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.unsubscribe = function(aData) {
//         var aUncubscribe = [];
//         if (aData && aData.length > 0) {
//             _.forEach(aData, function(data) {
//                 if (_.isArray(data)) {
//                     var atmp = {};
//                     if (data.email)
//                         atmp.email = data.email;
//                     if (data.comment)
//                         atmp.comment = data.comment;
//                     if (atmp)
//                         aUncubscribe[0] = atmp;
//                 }
//             });
//         }
//         var aRequest = {
//             action: 'unsubscribe',
//             emails: 'aUncubscribe'
//         };
//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.send_email = function(aData) {
//         if (!aData)
//             aData = {};
//         var aMessage = {
//             html: aData.html ? aData.html : '',
//             text: aData.text ? aData.text : '',
//             subject: aData.subject ? aData.subject : '',
//             encoding: aData.encoding ? aData.encoding : ''
//         };
//         if (aData.from) {
//             var aFrom = {
//                 name: aData.from.name ? aData.from.name : '',
//                 email: aData.from.email ? aData.from.email : ''
//             };
//             aMessage.from = aFrom
//         }
//         if (aData.to) {
//             var aTo = [];
//             _.forEach(aData.to, function(aRecipient) {
//                 var aToSingle = {
//                     name: aRecipient.name ? aRecipient.name : '',
//                     email: aRecipient.email ? aRecipient.email : ''
//                 };
//                 aTo.push(aToSingle);
//             });
//             aMessage.to = aTo;
//         }
//         if (aData.bcc) {
//             var aTo = [];
//             _.forEach(aData.bcc, function(aRecipient) {
//                 var aToSingle = {
//                     name: aRecipient.name ? aRecipient.name : '',
//                     email: aRecipient.email ? aRecipient.email : ''
//                 };
//                 aTo.push(aToSingle);
//             });
//             aMessage.to = aTo;
//         }
//         // if(aMessage.encoding && ['utf8', 'utf-8'].indexOf(aMessage.encoding) === -1) {
//         //     aMessage.html = 
//         // }

//         var aRequest = {
//             action: 'send_email',
//             message: aMessage
//         };

//         return this.__callApi(JSON.stringify(aRequest));
//     };

//     this.delete_unsubscribe = function(aData) {
//         var aDelUnsubscribe = [];
//         if (aData) {
//             _.forEach(aData, function(sEmail) {
//                 if (_.isString(sEmail))
//                     aDelUnsubscribe.push(sEmail);
//             });
//         }
//         var aRequest = {
//             action: 'delete_unsubscribe',
//             emails: aDelUnsubscribe
//         };
//         return this.__callApi(JSON.stringify(aRequest));
//     };
// }

// function AtomparkMail() {
//     var openKey = 'd265421ef1f5b9f3f28f9172a41f2bcc',
//         privateKey = '7868da747a4614369b8744ca69856786';

//     function makeRequest(url, params) {
//         request.post({
//             url: 'http://atompark.com/api/email/3.0/' + url,
//             form: params
//         }, function(error, resp, body) {
//             if (error || resp.statusCode !== 200) {
//                 console.log(error);
//             } else {
//                 console.log('body', body);
//                 return body;
//             }
//         });
//     }

//     function hashSum(action, data) {
//         var param = {
//             version: '3.0',
//             action: action,
//             key: openKey
//         }
//         if (data) {
//             for (property in data)
//                 param[property] = data[property];
//         }
//         param = ksort(param);
//         var sum = '';
//         for (property in param) {
//             sum += param[property];
//         }
//         sum += privateKey;
//         return md5(sum);
//     }

//     function addAddressbook(data) {
//         var action = 'addAddressbook',
//             paramForRequest = {
//                 key: openKey,
//                 sum: hashSum(action, data)
//             };
//         for (property in data)
//             paramForRequest[property] = data[property];
//         var result = makeRequest(action, paramForRequest);
//         if (result)
//             return result;
//         else
//             return 'request error';
//     }

//     function addAddresses(data) {
//         var action = 'addAddresses';
//         var paramForRequest = {
//             key: openKey,
//             sum: hashSum(action, data)
//         };
//         for (property in data)
//             paramForRequest[property] = data[property];
//         var result = makeRequest(action, paramForRequest);
//         if (result)
//             return result;
//         else
//             return 'request error';
//     }

//     function getAddressbook() {
//         var action = 'getAddressbook';
//         var paramForRequest = {
//             key: openKey,
//             sum: hashSum(action, '')
//         };
//         var result = makeRequest(action, paramForRequest);
//         if (result)
//             return result;
//         else
//             return 'request error';
//     }

//     function epochtaAdd(mail, groupName) {
//         if (!groupName)
//             groupName = 'Default';
//         var getBookRes = getAddressbook();
//         getBookRes = JSON.parse(getBookRes);
//         var adrBooksList = {};
//         for (property in getBookRes)
//             adrBooksList[property] = getBookRes[property];
//         if (adrBooksList.indexOf(groupName) !== -1) {
//             var epochtaAddRes = {
//                     log: '1.AddressBook already created,'
//                 },
//                 idOfRoom = array_search(groupName, adrBooksList),
//                 paramsForAddMail = {
//                     id_list: idOfRoom,
//                     email: [mail]
//                 },
//                 result = addAddresses(paramsForAddMail);
//             result = JSON.parse(result);
//             if (result && result.result === 1) {
//                 epochtaAddRes.log += '2.Mail add to address book.';
//                 return epochtaAddRes;
//             } else {
//                 epochtaAddRes.log += '2.Error in add to address book.';
//                 epochtaAddRes.error = {
//                     text: 'Error in add to address book';
//                 };
//                 return epochtaAddRes;
//             }
//         } else {
//             var epochtaAddRes = {
//                     log: '1.Need to create new addressBook'
//                 },
//                 result = addAddressbook({
//                     name: groupName
//                 });
//             result = JSON.parse(result);
//             if (result && result.result && result.result.addressbook_id) {
//                 epochtaAddRes.log += '2.AddressBook created successfully,';
//                 var paramsForAddMail = {
//                     id_list: result.result.addressbook_id,
//                     email: [mail]
//                 };
//                 result = addAddresses(paramsForAddMail);
//                 result = JSON.parse(result);
//                 if (result && result.result === 1) {
//                     epochtaAddRes.log += '3.Mail added to address book.';
//                     return epochtaAddRes;
//                 } else {
//                     epochtaAddRes.log += '3.Error in add to address book.';
//                     epochtaAddRes.error = {
//                         text: 'Error in add to address book'
//                     };
//                     return epochtaAddRes;
//                 }
//             } else {
//                 epochtaAddRes.log = '1.Error in creation new address book.';
//                 epochtaAddRes.error = {
//                     text: 'Error in creation new address book';
//                 };
//                 return epochtaAddRes;
//             }
//         }
//     }


// }

// exports.sendInstructions = function(req, res) {
//     console.log('ll');
//     return res.jsonp('lal');
// };
