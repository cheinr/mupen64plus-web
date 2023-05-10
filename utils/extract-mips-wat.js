const fs = require('fs');

const REGEX_TRANSFORMS = [
  {
    regex: /^i32\.const (.+)$/,
    transform: (r) => `    I32_CONST(${r[1]});`
  },
  {
    regex: /^i32\.load$/,    
    transform: (r) => `    I32_LOAD(0);`
  },
  {
    regex: /^i32\.load offset=(.+)$/,    
    transform: (r) => `    I32_LOAD(${r[1]});`
  },
  {
    regex: /^i32\.load(.+)_s$/,  
    transform: (r) => `    I32_LOAD${r[1]}_S(0);`
  },
  {
    regex: /^i32\.load(.+)_s offset=(.+)$/,  
    transform: (r) => `    I32_LOAD${r[1]}_S(${r[2]});`
  },
  {
  regex: /^i32\.load(.+)_u$/,  
  transform: (r) => `    I32_LOAD${r[1]}_U(0);`
  },
  {
    regex: /^i32\.load(.+)_u offset=(.+)$/,  
    transform: (r) => `    I32_LOAD${r[1]}_U(${r[2]});`
  },
  {
    regex: /^i64\.const (.+)$/,
    transform: (r) => `    I64_CONST(${r[1]});`,
  },
  {
    regex: /^i64\.load$/,  
    transform: (r) => `    I64_LOAD(0);`
  },
  {
    regex: /^i64\.load offset=(.+)$/,  
    transform: (r) => `    I64_LOAD(${r[1]});`
  },
  {
    regex: /^i64\.load16_u$/, 
    transform: (r) => `    I64_LOAD16_U(0);`
  },
  {
    regex: /^i64\.load(.+)_u$/,  
    transform: (r) => `    I64_LOAD${r[1]}_U(0);`
  },
  {
    regex: /^i64\.load(.+)_u offset=(.+)$/,  
    transform: (r) => `    I64_LOAD${r[1]}_U(${r[2]});`
  },
  {
    regex: /^i64\.load(.+)_s$/,  
    transform: (r) => `    I64_LOAD${r[1]}_S(0);`
  },
  {
    regex: /^i64\.load(.+)_s offset=(.+)$/,  
    transform: (r) => `    I64_LOAD${r[1]}_S(${r[2]});`
  },
  {
    regex: /^i64\.and$/,  
    transform: (r) => `    I64_AND;`
  },
  {
    regex: /^i64\.xor$/,  
    transform: (r) => `    I64_XOR;`
  },
  {
    regex: /^local\.set (.+)$/,  
    transform: (r) => `    LOCAL_SET(local${r[1]});`
  },
  {
    regex: /^local\.get (.+)$/,  
    transform: (r) => `    LOCAL_GET(local${r[1]});`
  },
  {
    regex: /^i32\.add$/,  
    transform: (r) => `    I32_ADD;`
  },
  {
    regex: /^i64\.extend_i32_s$/,  
    transform: (r) => `    I64_EXTEND_I32_S;`
  },
  {
    regex: /^i64\.store$/,  
    transform: (r) => `    I64_STORE(0);`
  },
  {
    regex: /^i64\.store offset=(.+)$/,  
    transform: (r) => `    I64_STORE(${r[1]});`
  },
  {
    regex: /^local\.tee (.+)$/,
    transform: (r) => `    LOCAL_TEE(local${r[1]});`
  },
  {
    regex: /^i32\.store$/,
    transform: (r) => `    I32_STORE(0);`
  },
  {
    regex: /^i32\.store offset=(.+)$/,
    transform: (r) => `    I32_STORE(${r[1]});`
  },// ------------------------------------------------------------------
  {
    regex: /^i32\.(.+)$/,
    transform: (r) => `    I32_${r[1].toUpperCase()};`
  },
  {
    regex: /^i64\.(.+)$/,
    transform: (r) => `    I64_${r[1].toUpperCase()};`
  },
  {
    regex: /^block \(result i32\).*$/,
    transform: (r) => `    I32_BLOCK;`
  },
  {
    regex: /^block \(result i64\).*$/,
    transform: (r) => `    I64_BLOCK;`
  },
  {
    regex: /^block  ;;.*$/,
    transform: (r) => `    VOID_BLOCK;`
  },
  {
    regex: /^loop  ;;.*$/,
    transform: (r) => `    VOID_LOOP;`
  },
  {
    regex: /^if  ;;.*$/,
    transform: (r) => `    IF;`
  },
  {
    regex: /^if \(result i64\).*$/,
    transform: (r) => `    IF_I64;`
  },
  {
    regex: /^if \(result i32\).*$/,
    transform: (r) => `    IF_I32;`
  },
  {
    regex: /^else$/,
    transform: (r) => `    ELSE;`
  },
  {
    regex: /^br ([0-9]+).*$/,
    transform: (r) => `    BR(${r[1]});`
  },
  {
    regex: /^br_if ([0-9]+).*$/,
    transform: (r) => `    BR_IF(${r[1]});`
  },
  {
    regex: /^end.*$/,
    transform: (r) => `    END;`
  },
  {
    regex: /^select$/,
    transform: (r) => `    SELECT;`
  },
  {
    regex: /^call \$r4300_write_aligned_dword$/,
    transform: (r) => `    R4300_WRITE_ALIGNED_DWORD_INDIRECT_CALL;`    
  },
  {
    regex: /^call \$r4300_write_aligned_word$/,
    transform: (r) => `    R4300_WRITE_ALIGNED_WORD_INDIRECT_CALL;`
  },
  {
    regex: /^call \$r4300_read_aligned_dword$/,
    transform: (r) => `    R4300_READ_ALIGNED_DWORD_INDIRECT_CALL;`
  },
  {
    regex: /^call \$check_cop1_unusable$/,
    transform: (r) => `    CHECK_COP1_UNUSABLE_INDIRECT_CALL;`
  },
  {
    regex: /^drop$/,
    transform: (r) => `    DROP;`
  }
];

// From https://inst.eecs.berkeley.edu/~cs61c/resources/MIPS_help.html
const R_TYPE_INSTRUCTIONS = [
  "SLL",
  "SRL",
  "SRA",
  "SLLV",
  "SRLV",
  "SRAV",
  "JR",
  "JALR",
  "SYSCALL",
  "MFHI",
  "MTHI",
  "MFLO",
  "MTLO",
  "MULT",
  "MULTU",
  "DIV",
  "DIVU",
  "DDIV",
  "DDIVU",
  "DMULTU",
  "ADD",
  "ADDU",
  "SUB",
  "SUBU",
  "AND",
  "DADD",
  "DADDU",
  "DSLL",
  "DSLLV",
  "DSLL32",
  "DSRA",
  "DSRAV",
  "DSRA32",
  "DSRL",
  "DSRLV",
  "DSRL32",
  "DSUB",
  "DSUBU",
  "OR",
  "XOR",
  "NOR",
  "SLT",
  "SLTU"];


const I_TYPE_INSTRUCTIONS = [
  "BEQ",
  "BNE",
  "BLEZ",
  "BGTZ",
  "ADDI",
  "ADDIU",
  "ANDI",
  "DADDI",
  "DADDIU",
  "SLTI",
  "SLTIU",
  "ANDI",
  "ORI",
  "XORI",
  "LUI",
  "LB",
  "LH",
  "LW",
  "LBU",
  "LHU",
  "SB",
  "SH",
  "SW"];

// Instructions that the compiler removed from the bundle
// because their implementation is the same as others
const instructionDedupeMappings = {
  "ADDU": "ADD",
  "ADDIU": "ADDI",
  "CACHE": "NOP",
  "DADDIU": "DADDI",
  "DADDU": "DADD",
  "DSUBU": "DSUB",
  "SUBU": "SUB",
  "SYNC": "NOP"
}

let instructions = [/*"RESERVED",*/
                    "ADD",                      
                    "ADDI",
                    "ADDIU",
                    "ADDU",
                    "AND",
                    "ANDI",
                    /*      "BC0F",
                       "BC0F_IDLE",
                       "BC0F_OUT",
                       "BC0FL",
                       "BC0FL_IDLE",
                       "BC0FL_OUT",
                       "BC0T",
                       "BC0T_IDLE",
                       "BC0T_OUT",
                       "BC0TL",
                       "BC0TL_IDLE",
                       "BC0TL_OUT",
                       "BC1F",
                       "BC1F_IDLE",
                       "BC1F_OUT",
                       "BC1FL",
                       "BC1FL_IDLE",
                       "BC1FL_OUT",
                       "BC1T",
                       "BC1T_IDLE",
                       "BC1T_OUT",
                       "BC1TL",
                       "BC1TL_IDLE",
                       "BC1TL_OUT",
                       "BC2F",
                       "BC2F_IDLE",
                       "BC2F_OUT",
                       "BC2FL",
                       "BC2FL_IDLE",
                       "BC2FL_OUT",
                       "BC2T",
                       "BC2T_IDLE",
                       "BC2T_OUT",
                       "BC2TL",
                       "BC2TL_IDLE",
                       "BC2TL_OUT",
                       "BEQ",
                       "BEQ_IDLE",
                       "BEQ_OUT",
                       "BEQL",
                       "BEQL_IDLE",
                       "BEQL_OUT",
                       "BGEZ",
                       "BGEZ_IDLE",
                       "BGEZ_OUT",
                       "BGEZAL",
                       "BGEZAL_IDLE",
                       "BGEZAL_OUT",
                       "BGEZALL",
                       "BGEZALL_IDLE",
                       "BGEZALL_OUT",
                       "BGEZL",
                       "BGEZL_IDLE",
                       "BGEZL_OUT",
                       "BGTZ",
                       "BGTZ_IDLE",
                       "BGTZ_OUT",
                       "BGTZL",
                       "BGTZL_IDLE",
                       "BGTZL_OUT",
                       "BLEZ",
                       "BLEZ_IDLE",
                       "BLEZ_OUT",
                       "BLEZL",
                       "BLEZL_IDLE",
                       "BLEZL_OUT",
                       "BLTZ",
                       "BLTZ_IDLE",
                       "BLTZ_OUT",
                       "BLTZAL",
                       "BLTZAL_IDLE",
                       "BLTZAL_OUT",
                       "BLTZALL",
                       "BLTZALL_IDLE",
                       "BLTZALL_OUT",
                       "BLTZL",
                       "BLTZL_IDLE",
                       "BLTZL_OUT",
                       "BNE",
                       "BNE_IDLE",
                       "BNE_OUT",
                       "BNEL",
                       "BNEL_IDLE",
                       "BNEL_OUT",*/
                    "BREAK",
                    "CACHE",
                    "CFC0",
                    "CFC1",
                    "CFC2",
                    "CP1_ABS",
                    "CP1_ADD",
                    "CP1_CEIL_L",
                    "CP1_CEIL_W",
                    "CP1_C_EQ",
                    "CP1_C_F",
                    "CP1_C_LE",
                    "CP1_C_LT",
                    "CP1_C_NGE",
                    "CP1_C_NGL",
                    "CP1_C_NGLE",
                    "CP1_C_NGT",
                    "CP1_C_OLE",
                    "CP1_C_OLT",
                    "CP1_C_SEQ",
                    "CP1_C_SF",
                    "CP1_C_UEQ",
                    "CP1_C_ULE",
                    "CP1_C_ULT",
                    "CP1_C_UN",
                    "CP1_CVT_D",
                    "CP1_CVT_L",
                    "CP1_CVT_S",
                    "CP1_CVT_W",
                    "CP1_DIV",
                    "CP1_FLOOR_L",
                    "CP1_FLOOR_W",
                    "CP1_MOV",
                    "CP1_MUL",
                    "CP1_NEG",
                    "CP1_ROUND_L",
                    "CP1_ROUND_W",
                    "CP1_SQRT",
                    "CP1_SUB",
                    "CP1_TRUNC_L",
                    "CP1_TRUNC_W",
                    "CTC0",
                    /*"CTC1", skipping for now */
                    "CTC2",
                    "DADD",
                    "DADDI",
                    "DADDIU",
                    "DADDU",
                    "DDIV",
                    "DDIVU",
                    "DIV",
                    "DIVU",
                    "DMFC0",
                    "DMFC1",
                    "DMFC2",
                    "DMTC0",
                    "DMTC1",
                    "DMTC2",
                    "DMULT",
                    "DMULTU",
                    "DSLL",
                    "DSLL32",
                    "DSLLV",
                    "DSRA",
                    "DSRA32",
                    "DSRAV",
                    "DSRL",
                    "DSRL32",
                    "DSRLV",
                    "DSUB",
                    "DSUBU",
                    "ERET",
                    /*      "J",
                       "J_IDLE",
                       "J_OUT",
                       "JAL",
                       "JAL_IDLE",
                       "JAL_OUT",
                       "JALR",
                       "JALR_IDLE",
                       "JALR_OUT",
                       "JR",
                       "JR_IDLE",
                       "JR_OUT",*/
                    "LB",
                    "LBU",
                    "LD",
                    "LDC1",
                    "LDC2",
                    "LDL",
                    "LDR",
                    "LH",
                    "LHU",
                    "LL",
                    "LLD",
                    "LUI",
                    "LW",
                    "LWC1",
                    "LWC2",
                    "LWL",
                    "LWR",
                    "LWU",
                    "MFC0",
                    "MFC1",
                    "MFC2",
                    "MFHI",
                    "MFLO",
                    "MTC0",
                    "MTC1",
                    "MTC2",
                    "MTHI",
                    "MTLO",
                    "MULT",
                    "MULTU",
                    "NOP",
                    "NOR",
                    "OR",
                    "ORI",
                    "SB",
                    "SC",
                    "SCD",
                    "SD",
                    /*"SDC1", Hard to debug error */
                    "SDC2",
                    "SDL",
                    "SDR",
                    "SH",
                    "SLL",
                    "SLLV",
                    "SLT",
                    "SLTI",
                    "SLTIU",
                    "SLTU",
                    "SRA",
                    "SRAV",
                    "SRL",
                    "SRLV",
                    "SUB",
                    "SUBU",
                    "SW",
                    "SWC1",
                    "SWC2",
                    "SWL",
                    "SWR",
                    "SYNC",
                    /*"SYSCALL", skipping for now*/
                    "TEQ",
                    "TEQI",
                    "TGE",
                    "TGEI",
                    "TGEIU",
                    "TGEU",
                    /*"TLBP",
                       "TLBR",
                       "TLBWI",
                       "TLBWR", skipping for now*/
                    "TLT",
                    "TLTI",
                    "TLTIU",
                    "TLTU",
                    "TNE",
                    "TNEI",
                    "XOR",
                    "XORI"];

const text = fs.readFileSync('module5.wat', { encoding: 'utf8' });

let out = ``;


const nonCompileableInstructions = new Set();
const results = instructions.map((inst) => getInterpFunction(inst));
console.log(nonCompileableInstructions);
console.log(nonCompileableInstructions.size);


const successfullyCompiled = results.filter((result) => result && result.numCompileFailures == 0);
successfullyCompiled.forEach((compileResult) => {
  out += compileResult.generated;
  out += "\n";
  console.log(compileResult.generated);
});

const notSuccessfullyCompiled = results.filter((result) => result && result.numCompileFailures > 0);


//console.log("notSuccessfullyCompiled: %o", notSuccessfullyCompiled.sort((r1, r2) => r2.numCompileFailures - r1.numCompileFailures).map((r) => {
  //r.generated = "";
//  return r;
//}));

console.log("Successfully compiled %o functions", results.length - notSuccessfullyCompiled.length);
console.log("Unable to compile %o functions", notSuccessfullyCompiled.length);

//console.log(results.filter((result) => result && result.numCompileFailures == 0).map((result) => {
//  return Object.assign({}, result, { generated: '' });
//}));

function regexTransform(regexp, transformFunc, wasmLine) {
  const execResult = regexp.exec(wasmLine.trim());
  if (execResult) {
    return transformFunc(execResult);//`    I32_CONST(${i32ConstRegexExecResult[1]});`;
  } else {
    return false;
  }
}

function attemptTransform(wasmLine, instrName) {

  if (wasmLine.trim() == '') {
    return { value: '', success: true };
  }

  for (let transform of REGEX_TRANSFORMS) {
    const transformResult = regexTransform(transform.regex, transform.transform, wasmLine);
    if (transformResult !== false ) {
      return { value: transformResult, success: true };
    }
  }

  if (/^call \$r4300_pc_struct$/.exec(wasmLine.trim())) {
    return { value: wasmLine, success: true };
  }


  if (/^call \$exception_general$/.exec(wasmLine.trim())) {
    return { value: wasmLine, success: true };
  }
  
  nonCompileableInstructions.add(wasmLine.trim());
  console.log("No transformation exists for instruction: %s!", wasmLine);
  return { value: wasmLine, success: false };
}

function performMultiLineReplacements(generatedFunction, name) {



  let instructionType;
  if (I_TYPE_INSTRUCTIONS.includes(name)) {
    instructionType = "I";
  } else if (R_TYPE_INSTRUCTIONS.includes(name)) {
    instructionType = "R";
  }

  console.log("PerformMultiLineREplacement: %o; instructionType: %s", name, instructionType);
  
  let out = generatedFunction;
  
  /*  out = out.replace(
     /I32_CONST\(.+\);\n.+call \$r4300_pc_struct/gmi,
     "CALL_R4300_PC_STRUCT;");*/

  // Move these out of here
  out = out.replace(
    /I32_CONST\(1747816\);/gmi,
    "I32_CONST((int) &g_dev.r4300);");

  out = out.replace(
    /I32_CONST\(1748072\);/gmi,
    "I32_CONST((int) &(&g_dev.r4300)->hi);");

  out = out.replace(
    /I32_CONST\(1748080\);/gmi,
    "I32_CONST((int) &(&g_dev.r4300)->lo);");

  out = out.replace(
    /I32_CONST\(1748092\);/gmi,
    "I32_CONST((int) &(&g_dev.r4300)->pc);");

  out = out.replace(
    /I32_CONST\(15382664\);/gmi,
    "I32_CONST((int)  &(&(&g_dev.r4300)->cp1)->fcr0);");

  out = out.replace(
    /I32_CONST\(15382664\);/gmi,
    "I32_CONST((int)  &(&(&g_dev.r4300)->cp1)->fcr0);");

  out = out.replace(
    /I32_CONST\(15382668\);/gmi,
    "I32_CONST((int)  &(&(&g_dev.r4300)->cp1)->fcr31);");

  out = out.replace(
    /I32_CONST\(15382672\);/gmi,
    "I32_CONST((int)  &(&(&g_dev.r4300)->cp1)->regs_simple);");

  out = out.replace(
    /I32_CONST\(15382800\);/gmi,
    "I32_CONST((int)  &(&(&g_dev.r4300)->cp1)->regs_double);");

  
  out = out.replace(
    /I32_CONST\(1747816\);\n.+call \$exception_general$/gmi,
    "CALL_EXCEPTION_GENERAL;");

  out = out.replace(
     /I32_CONST\(0\);\n.+generate_block_exit_check\(\);/gmi,
    "");

  out = out.replace(/I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+LOCAL_TEE\(local0\);\n.+I32_LOAD\(16\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(12\);\n.+I32_LOAD\(0\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(8\);\n.+I32_LOAD\(0\);/gmi,
                    "LOAD_RRD_ADDRESS;\n    LOAD_RRT32_VALUE;\n    LOAD_RRS32_VALUE;");

  // RRD_ADDRESS; RRS, RRT(64), RRD
  out = out.replace(/I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+LOCAL_TEE\(local0\);\n.+I32_LOAD\(16\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(8\);\n.+I64_LOAD\(0\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(12\);\n.+I64_LOAD\(0\);/gmi,
                    "LOAD_RRD_ADDRESS;\n    LOAD_RRS_VALUE;\n    LOAD_RRT_VALUE;");
  

  // ANDI
  // irt, irs, iimmediate
  out = out.replace(/I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+LOCAL_TEE\(local0\);\n.+I32_LOAD\(12\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(8\);\n.+I64_LOAD\(0\);\n.+LOCAL_GET\(local0\);\n.+I64_LOAD16_U\(16\);/gmi,
                    "LOAD_IRT_ADDRESS;\n    LOAD_IRS_VALUE;\n    LOAD_IIMMEDIATE_64U;");
  //----------------


  // ADDI
  // irt, iimmediate, irs32
  out = out.replace(/I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+LOCAL_TEE\(local0\);\n.+I32_LOAD\(12\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD16_S\(16\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(8\);\n.+I32_LOAD\(0\);/gmi,
                    "LOAD_IRT_ADDRESS;\n    LOAD_IIMMEDIATE_32S;\n    LOAD_IRS32_VALUE;");

  
  // ---------------

  // DADDI
  out = out.replace(/I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+LOCAL_TEE\(local0\);\n.+I32_LOAD\(12\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(8\);\n.+I64_LOAD\(0\);\n.+LOCAL_GET\(local0\);\n.+I64_LOAD16_S\(16\);/gmi,
                    "LOAD_IRT_ADDRESS;\n    LOAD_RRS_VALUE;\n    LOAD_IIMMEDIATE_64S;");

  // SUBU
  // rrs32 rrt32
  out = out.replace(/I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+LOCAL_TEE\(local0\);\n.+I32_LOAD\(16\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(8\);\n.+I32_LOAD\(0\);\n.+LOCAL_GET\(local0\);\n.+I32_LOAD\(12\);\n.+I32_LOAD\(0\);/gmi,
                    "LOAD_RRD_ADDRESS;\n    LOAD_RRS32_VALUE;\n    LOAD_RRT32_VALUE;");


  // ------------------------------
  //*/
  /*
     }

     const incrementPCRegexp = /CALL_R4300_PC_STRUCT;\n.+LOCAL_TEE\((.+)\);\n.+I32_LOAD\(0\);\n.+I32_CONST\(140\);\n.+I32_ADD;\n.+LOCAL_SET\((.+)\);\n.+LOCAL_GET\(.+\);\n.+LOCAL_GET\(.+\);\n.+I32_STORE\(0\);/mi;
     incrementPCRegexpExecResult = incrementPCRegexp.exec(out);
     
     if (incrementPCRegexpExecResult) {
     out = out.replace(incrementPCRegexp,
     `INCREMENT_PC_BY_ONE(${incrementPCRegexpExecResult[1]}, ${incrementPCRegexpExecResult[2]});`);
     
     }

   */


  out = out.replace(
    /I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_CONST\(\(int\) &\(&g_dev.r4300\)->pc\);\n.+I32_LOAD\(0\);\n.+I32_CONST\(140\);\n.+I32_ADD;\n.+I32_STORE\(0\);$/gmi,
    "INCREMENT_PC_BY_ONE;");


    return out;
}

    function getInterpFunction(name) {

      let symbolName = name;
      if (instructionDedupeMappings[name]) {
    console.log("instructionDedupeMapping: %o", instructionDedupeMappings[name]);
    symbolName = instructionDedupeMappings[name];
  }
  
  const regexp = new RegExp(`func \\$recomp_wasm_interp_${symbolName} `);
  const funcStart = text.search(regexp);
  const funcLength = text.slice(funcStart).search(/\(func/) - 1;
  //out += text.slice(funcStart-1, funcStart+funcLength).replace('type 7', 'type 1');
  const functionBody = text.slice(funcStart-1, funcStart+funcLength).replace('type 7', 'type 1');
  //  console.log(functionBody);

  const functionBodyLines = functionBody.split("\n").filter((line) => line.trim() !== '');
 // console.log("functionBodyLines: %o", functionBodyLines);
  if (!functionBodyLines[1]) {
    console.log("empty functionBody for %o!", name);
    return;
  }

  functionBodyLines[functionBodyLines.length - 1] = functionBodyLines[functionBodyLines.length - 1].replace(")", "");
  console.log(functionBodyLines);

  let generated = `static void wasm_gen_${name}(struct precomp_instr* inst) {\n\n`;

  let startLine = 1;
  if (functionBodyLines[1].includes("(local")) {
    startLine = 2;
    const localDeclarations = functionBodyLines[1].trim().replace("(", "").replace(")", "").replace("local ", "").split(" ");
    //generated += `    printf("generating: ${name}; wasm_code_length=%u", wasm_code_length);\n`;
    localDeclarations.forEach((localType, index) => {
      generated += `    uint32_t local${index} = claim_${localType}_local();\n`;
    });
  }

  generated += `\n`;

  let numFailures = 0;
  for (let i = startLine; i < functionBodyLines.length; i++) {
    const transformResult = attemptTransform(functionBodyLines[i], name);
    if (!transformResult.success) {
      numFailures++;
    }
    generated += `${transformResult.value}\n`;
  }

  generated += "    generate_block_exit_check();\n";
  generated += "    release_locals();\n";
  generated += "}";


  generated = performMultiLineReplacements(generated, name);
  
  console.log("generated: " + generated);

  return {
    name,
    generated,
    numCompileFailures: numFailures
  }
}


fs.writeFileSync('out.c', out);
