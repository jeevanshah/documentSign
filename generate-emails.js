const students = `Kush KUNWOR (CIHE22850)
Nikhil KUNWAR (CIHE24292)
Mandira NAGARKOTI (CIHE24398)
Rajesh KUMAR (CIHE23162)
Megh Prasad SHRESTHA (CIHE23188)
Sujan GURAGAIN (CIHE23239)
Pipul ADHIKARI (CIHE23117)
Ishwor BASNET (CIHE23142)
Shirish Kumar KARNA (CIHE23112)
Siddhartha KHADKA (CIHE23032)
Sudir BARAL (CIHE24855)
Anish GOLE (CIHE24845)
Bibek RANABHAT (CIHE23085)
Aashish THAPA (CIHE23201)
Til Kumar SHRESTHA (CIHE23055)
Ashmita BHANDARI (CIHE22644)
Harish BHATT (CIHE22641)
Rohini TAMANG (CIHE22719)
Suraj G C (CIHE22718)
Sulab KHADKA (CIHE22978)
Niruta BHANDARI (CIHE24675)
Pasang TAMANG (CIHE23168)
Dinesh KHATRI (CIHE24473)
Abiskar BHANDARI (CIHE24504)
Aanzu PUN (CIHE23041)
Nirakar Jit LAMA (CIHE22968)
Anjan TAMANG (CIHE22907)
Aakriti OLI (CIHE22942)
Sushil ADHIKARI (CIHE22571)
Kushal ADHIKARI (CIHE22856)
Bivek THAPA (CIHE22714)
Abhishek KAFLE (CIHE22649)`;

// Extract student IDs and generate emails
const emails = students.split('\n').map(line => {
  const match = line.match(/\(([A-Z0-9]+)\)/);
  if (match) {
    const studentId = match[1].toLowerCase();
    return `${studentId}@churchill.nsw.edu.au`;
  }
  return null;
}).filter(Boolean);

console.log('Student Emails:');
console.log('='.repeat(50));
emails.forEach(email => console.log(email));

console.log('\n' + '='.repeat(50));
console.log(`Total: ${emails.length} students`);

// Also generate as array for easy use in scripts
console.log('\nAs JavaScript array:');
console.log(JSON.stringify(emails, null, 2));

// Save to file
const fs = require('fs');
fs.writeFileSync('student-emails.txt', emails.join('\n'));
console.log('\n✓ Saved to student-emails.txt');
