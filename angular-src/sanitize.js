module.exports = {

  // HTML entity encoding
     encodeHTML: function(input) {
       if(typeof input === 'string' && input!=""){
      return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
    }
    else {
      return false;

    }
  }

}
