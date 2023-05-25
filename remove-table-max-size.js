const fs = require('fs');

const fileName = process.argv[2];

const binary = fs.readFileSync(fileName);

const buffer = binary.buffer;
const view = new Uint8Array(buffer);

const tableSectionIndex = findTableSection(view);

const funcRefTableIndex = findFuncrefTable(view, tableSectionIndex);
console.log(funcRefTableIndex);

if (view[funcRefTableIndex + 1] === 0x01) {
  console.log("Removing funcref table limit!");
  view[funcRefTableIndex + 1] = 0x00;
  console.log('tableSectionIndex: ' + view[tableSectionIndex + 1]);
  view[tableSectionIndex + 1] = view[tableSectionIndex + 1] - 1; // TODO - assume uleb128 encoding 

  console.log('funcRefTableIndex+1: ' + view[funcRefTableIndex + 1]);
  console.log('tableSectionIndex: ' + view[tableSectionIndex + 1]);
  const newByteBuffer = new Uint8Array(view.length - 1);
  let destIndex = 0;
  view.forEach((byte, index) => {
    if (index !== (funcRefTableIndex + 3)) {
      newByteBuffer[destIndex++] = byte;
    } else {
      console.log("skipping byte!");
    }
  });

  console.log(newByteBuffer);
  fs.writeFileSync(fileName, newByteBuffer);
}


function findFuncrefTable(byteArray, tableSectionIndex) {
  let curr = tableSectionIndex;

  const { result, numBytesRead } = readULEB128(byteArray, ++curr);
  const size = result;
  console.log("size: %o", size);
  console.log("numBytesRead: %o", numBytesRead);
    
  const numTables = byteArray[curr  + numBytesRead];
  console.log("numTables: %o", numTables);
  
  curr += numBytesRead + 1;
  for (let i = 0; i < numTables; i++) {
    const tableType = byteArray[curr];
    if (tableType === 0x70) {
      return curr;
    }

    const limitFlag = byteArray[curr+1];
    if (limitFlag == 0x01) {
      curr += 3;
    } else {
      curr += 2;
    }
  }
}


// ---- Use this example ----

// Section start: 0x016a = 362
// Section end:   0x02ac = 684
// length = 322 = 101000010

//encode:
//
// 0000010 1000010
// 00000010 (2) 11000010 (194)


//decode:

// take lower 7 bits of first byte (194)
// 1000010
// Realize first bit is not 0, go to next byte
// take lower 7 bits of next byte (2)
// 000010
// put that in front of the first set of 7 bits
// 000010 1000010
// realize the first bit was 0 and return
// ---


function readULEB128(byteArray, startIndex) {

  let numBytes = 0;
  let result = 0;
  let shift = 0;
  while (true) {
    byte = byteArray[startIndex + numBytes];
    numBytes++;
    
    console.log('byte: %o', byte);
    const lowerOrderSevenBits = byte & 0x7f; //0b11111110;

    console.log('lowerSevenBits: %o', lowerOrderSevenBits);
    console.log('lowerSevenBits << shift: %o', lowerOrderSevenBits << shift);

    result = result | (lowerOrderSevenBits << shift);
    result |= lowerOrderSevenBits << shift;

    console.log('result: %o', result);

    //if (byte >> 7 == 0) { // byte >> 7
    if ((0x80 & byte) === 0) {
      return { result: result, numBytesRead: numBytes };
    }
    shift += 7;
  }
}


//import start 0x9e
//import end 
function findTableSection(byteArray) {

  const sectionMap = {
    1: "TYPE",
    2: "IMPORT",
    3: "FUNCTION",
    4: "TABLE",
    5: "MEMORY",
    6: "GLOBAL",
    7: "EXPORT",
    9: "ELEM",
    10: "CODE",
    11: "DATACOUNT"
  }
  
  console.log('byteArray: %o', byteArray);
  let curr = 8;
  console.log(byteArray[curr]);
  while (byteArray[curr] !== 4) {

    const sectionId = byteArray[curr];
    console.log("sectionId=%o, section: %o", sectionId, sectionMap[sectionId]);

    const { result, numBytesRead } = readULEB128(byteArray, ++curr);// 0x0169);

    console.log("numBytesRead: " + numBytesRead);
    const size = result;
    curr += size + numBytesRead;
    console.log("curr: %o/%o", curr, curr.toString(16));
  }


  return curr;
}


/*
   if (byteArray[curr] === 1) {
   // section "Type"

   console.log("section TYPE");

   // curr + 1
   const size = readULEB128(byteArray, 0x09);// 0x0169);
   console.log("size: %o", size);
   curr += size + 3;
   console.log("curr: %o", curr);
   } else if (byteArray[curr] === 2) {
   // Section "Import"
   console.log("section IMPORT");

   const size = byteArray[curr + 1];
   curr += size;
   
   } else if (byteArray[curr] === 3) {
   // Section "Function"
   console.log("section FUNCTION");
   const size = byteArray[curr + 1];
   curr += size;

   } else if (byteArray[curr] === 5) {
   // Section "Memory"
   console.log("section MEMORY");
   } else if (byteArray[curr] === 6) {
   // Section "Global"
   console.log("section GLOBAL");
   break;
   } else if (byteArray[curr] === 7) {
   // Section "Export"
   console.log("section EXPORT");
   const size = byteArray[curr + 1];
   curr += size;

   } else if (byteArray[curr] === 9) {
   // Section "Elem"
   console.log("section ELEM");
   } else if (byteArray[curr] === 10) {
   // Section "Code"
   console.log("section CODE");
   const size = byteArray[curr + 1];
   curr += size;

   } else if (byteArray[curr] === 11) {
   // Section "Data"
   console.log("section DATA");
   break;
   }  else if (byteArray[curr] === 12) {
   // Section "DataCount"
   console.log("section DataCount");
   } else {
   console.log("Invalid section: %o", byteArray[curr]);
   }
 */

