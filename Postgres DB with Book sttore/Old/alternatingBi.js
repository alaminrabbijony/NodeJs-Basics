/**
 * @param {number} n
 * @return {boolean}
 */
var hasAlternatingBits = function(n) {
     if (n ===1) {
        return false
    }
    bi = n.toString(2).split('')

    for (let i = 0; i < bi.length; i++) {
      
        if (bi[i] === bi[i+1]) {
            return false
        }
        return true
    }
    return false

};

console.log(hasAlternatingBits(7)) 

// Input: n = 5
// Output: true
// Explanation: The binary representation of 5 is: 101

// Input: n = 7
// Output: false
// Explanation: The binary representation of 7 is: 111.


// Input: n = 11
// Output: false
// Explanation: The binary representation of 11 is: 1011.