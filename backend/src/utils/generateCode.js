const { User } = require('../models/User');

class CodeGenerator {
  static async generateManagerCode() {
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 50) {
      const randomNum = String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0');
      code = `EVMAN${randomNum}`;
      
      const existing = await User.findOne({
        where: { registration_code: code }
      });
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    
    return code || `EVMAN${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`;
  }
  
  static async generateAdminCode() {
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 50) {
      const randomNum = String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0');
      code = `ADM${randomNum}`;
      
      const existing = await User.findOne({
        where: { registration_code: code }
      });
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }
    
    return code || `ADM${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`;
  }
}

module.exports = { CodeGenerator };