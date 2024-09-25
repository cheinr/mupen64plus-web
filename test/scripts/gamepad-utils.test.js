import { updateAutoInputConfig } from '../../scripts/gamepad-utils';


test("OverwritesConfig", () => {
  const ini = "[FooBar Controller]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(000, 000)\n"
            + "Y Axis = key(000, 000)\n"
            + "\n"
            + "[Controller1]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(111, 111)\n"
            + "Y Axis = key(111, 111)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(222, 222)\n"
            + "Y Axis = key(222, 222)\n";

  const config = {
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "Controller1", config);

  const expected = "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(000, 000)\n"
                 + "Y Axis = key(000, 000)\n"
                 + "\n"
                 + "[Controller1]\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(222, 222)\n"
                 + "Y Axis = key(222, 222)\n";


  expect(result).toEqual(expected);
});

test("OverwritesConfigWithMultipleHeaders", () => {
  const ini = "[FooBar Controller]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(000, 000)\n"
            + "Y Axis = key(000, 000)\n"
            + "\n"
            + "[Controller0]\n"
            + "[Controller1]\n"
            + "[ControllerNot2]\n"
            + "[Controller3]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(111, 111)\n"
            + "Y Axis = key(111, 111)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(222, 222)\n"
            + "Y Axis = key(222, 222)\n";

  const config = {
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "Controller1", config);

  const expected = "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(000, 000)\n"
                 + "Y Axis = key(000, 000)\n"
                 + "\n"
                 + "[Controller0]\n"
                 + "[Controller1]\n"
                 + "[ControllerNot2]\n"
                 + "[Controller3]\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(222, 222)\n"
                 + "Y Axis = key(222, 222)\n";


  expect(result).toEqual(expected);
});

test("OverwritesConfigWithMultipleNewlines", () => {
  const ini = "[FooBar Controller]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(000, 000)\n"
            + "Y Axis = key(000, 000)\n"
            + "\n"
            + "\n"
            + "[Controller1]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(111, 111)\n"
            + "Y Axis = key(111, 111)\n"
            + "\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(222, 222)\n"
            + "Y Axis = key(222, 222)\n";

  const config = {
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "Controller1", config);

  const expected = "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(000, 000)\n"
                 + "Y Axis = key(000, 000)\n"
                 + "\n"
                 + "\n"
                 + "[Controller1]\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(222, 222)\n"
                 + "Y Axis = key(222, 222)\n";


  expect(result).toEqual(expected);
});

test("WritesConfigAtEndOfFileIfNoEntryExists", () => {
  const ini = "[Keyboard]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "mouse = False\n"
            + "DPad R = key(100)\n"
            + "DPad L = key(97)\n"
            + "DPad D = key(115)\n"
            + "DPad U = key(119)\n"
            + "Start = key(13)\n"
            + "Z Trig = key(122)\n"
            + "B Button = key(306)\n"
            + "A Button = key(304)\n"
            + "C Button R = key(108)\n"
            + "C Button L = key(106)\n"
            + "C Button D = key(107)\n"
            + "C Button U = key(105)\n"
            + "R Trig = key(99)\n"
            + "L Trig = key(120)\n"
            + "Mempak switch = key(44)\n"
            + "Rumblepak switch = key(46)\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "mouse = False\n"
            + "DPad R = key(100)\n"
            + "DPad L = key(97)\n"
            + "DPad D = key(115)\n"
            + "DPad U = key(119)\n"
            + "Start = key(13)\n"
            + "Z Trig = key(122)\n"
            + "B Button = key(306)\n"
            + "A Button = key(304)\n"
            + "C Button R = key(108)\n"
            + "C Button L = key(106)\n"
            + "C Button D = key(107)\n"
            + "C Button U = key(105)\n"
            + "R Trig = key(99)\n"
            + "L Trig = key(120)\n"
            + "Mempak switch = key(44)\n"
            + "Rumblepak switch = key(46)\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n"
            + "\n";

  const config = {
    "plugged": "True",
    "plugin": "2",
    "mouse": "False",
    "DPad R": "key(100)",
    "DPad L": "key(97)",
    "DPad D": "key(115)",
    "DPad U": "key(119)",
    "Start": "key(13)",
    "Z Trig": "key(122)",
    "B Button": "key(306)",
    "A Button": "key(304)",
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "R Trig": "key(99)",
    "L Trig": "key(120)",
    "Mempak switch": "key(44)",
    "Rumblepak switch": "key(46)",
    "X Axis": "key(276, 275)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "FooBar Controller", config);

  const expected = "[Keyboard]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "DPad R = key(100)\n"
                 + "DPad L = key(97)\n"
                 + "DPad D = key(115)\n"
                 + "DPad U = key(119)\n"
                 + "Start = key(13)\n"
                 + "Z Trig = key(122)\n"
                 + "B Button = key(306)\n"
                 + "A Button = key(304)\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "R Trig = key(99)\n"
                 + "L Trig = key(120)\n"
                 + "Mempak switch = key(44)\n"
                 + "Rumblepak switch = key(46)\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "DPad R = key(100)\n"
                 + "DPad L = key(97)\n"
                 + "DPad D = key(115)\n"
                 + "DPad U = key(119)\n"
                 + "Start = key(13)\n"
                 + "Z Trig = key(122)\n"
                 + "B Button = key(306)\n"
                 + "A Button = key(304)\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "R Trig = key(99)\n"
                 + "L Trig = key(120)\n"
                 + "Mempak switch = key(44)\n"
                 + "Rumblepak switch = key(46)\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "\n"
                 + "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "DPad R = key(100)\n"
                 + "DPad L = key(97)\n"
                 + "DPad D = key(115)\n"
                 + "DPad U = key(119)\n"
                 + "Start = key(13)\n"
                 + "Z Trig = key(122)\n"
                 + "B Button = key(306)\n"
                 + "A Button = key(304)\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "R Trig = key(99)\n"
                 + "L Trig = key(120)\n"
                 + "Mempak switch = key(44)\n"
                 + "Rumblepak switch = key(46)\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)";

  expect(result).toEqual(expected);
});

test("WritesConfigAtEndOfFileIfNoEntryExistsNoNewline", () => {
  const ini = "[Keyboard]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "mouse = False\n"
            + "DPad R = key(100)\n"
            + "DPad L = key(97)\n"
            + "DPad D = key(115)\n"
            + "DPad U = key(119)\n"
            + "Start = key(13)\n"
            + "Z Trig = key(122)\n"
            + "B Button = key(306)\n"
            + "A Button = key(304)\n"
            + "C Button R = key(108)\n"
            + "C Button L = key(106)\n"
            + "C Button D = key(107)\n"
            + "C Button U = key(105)\n"
            + "R Trig = key(99)\n"
            + "L Trig = key(120)\n"
            + "Mempak switch = key(44)\n"
            + "Rumblepak switch = key(46)\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "mouse = False\n"
            + "DPad R = key(100)\n"
            + "DPad L = key(97)\n"
            + "DPad D = key(115)\n"
            + "DPad U = key(119)\n"
            + "Start = key(13)\n"
            + "Z Trig = key(122)\n"
            + "B Button = key(306)\n"
            + "A Button = key(304)\n"
            + "C Button R = key(108)\n"
            + "C Button L = key(106)\n"
            + "C Button D = key(107)\n"
            + "C Button U = key(105)\n"
            + "R Trig = key(99)\n"
            + "L Trig = key(120)\n"
            + "Mempak switch = key(44)\n"
            + "Rumblepak switch = key(46)\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n";

  const config = {
    "plugged": "True",
    "plugin": "2",
    "mouse": "False",
    "DPad R": "key(100)",
    "DPad L": "key(97)",
    "DPad D": "key(115)",
    "DPad U": "key(119)",
    "Start": "key(13)",
    "Z Trig": "key(122)",
    "B Button": "key(306)",
    "A Button": "key(304)",
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "R Trig": "key(99)",
    "L Trig": "key(120)",
    "Mempak switch": "key(44)",
    "Rumblepak switch": "key(46)",
    "X Axis": "key(276, 275)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "FooBar Controller", config);

  const expected = "[Keyboard]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "DPad R = key(100)\n"
                 + "DPad L = key(97)\n"
                 + "DPad D = key(115)\n"
                 + "DPad U = key(119)\n"
                 + "Start = key(13)\n"
                 + "Z Trig = key(122)\n"
                 + "B Button = key(306)\n"
                 + "A Button = key(304)\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "R Trig = key(99)\n"
                 + "L Trig = key(120)\n"
                 + "Mempak switch = key(44)\n"
                 + "Rumblepak switch = key(46)\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "DPad R = key(100)\n"
                 + "DPad L = key(97)\n"
                 + "DPad D = key(115)\n"
                 + "DPad U = key(119)\n"
                 + "Start = key(13)\n"
                 + "Z Trig = key(122)\n"
                 + "B Button = key(306)\n"
                 + "A Button = key(304)\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "R Trig = key(99)\n"
                 + "L Trig = key(120)\n"
                 + "Mempak switch = key(44)\n"
                 + "Rumblepak switch = key(46)\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "DPad R = key(100)\n"
                 + "DPad L = key(97)\n"
                 + "DPad D = key(115)\n"
                 + "DPad U = key(119)\n"
                 + "Start = key(13)\n"
                 + "Z Trig = key(122)\n"
                 + "B Button = key(306)\n"
                 + "A Button = key(304)\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "R Trig = key(99)\n"
                 + "L Trig = key(120)\n"
                 + "Mempak switch = key(44)\n"
                 + "Rumblepak switch = key(46)\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)";

  expect(result).toEqual(expected);
});

test("OverwritesConfigOnFirstLine", () => {
  const ini = "[FooBar Controller]\n"
            + "plugged = True\n"
            + "Y Axis = key(111, 111)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "Y Axis = key(222, 222)\n"
            + "\n";

  const config = {
    "plugged": "True",
    "plugin": "2",
    "mouse": "False",
    "foo": "bar"
  }

  const result = updateAutoInputConfig(ini, "FooBar Controller", config);

  const expected = "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "mouse = False\n"
                 + "foo = bar\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "plugged = True\n"
                 + "Y Axis = key(222, 222)\n"
                 + "\n";

  expect(result).toEqual(expected);
});

test("OverwritesLastConfigInFile", () => {
  const ini = "[FooBar Controller]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n"
            + "\n";

  const config = {
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "Controller2", config);

  const expected = "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n";

  expect(result).toEqual(expected);
});

test("OverwritesLastConfigInFileNoNewline", () => {
  const ini = "[FooBar Controller]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n"
            + "\n"
            + "[Controller2]\n"
            + "plugged = True\n"
            + "plugin = 2\n"
            + "X Axis = key(276, 275)\n"
            + "Y Axis = key(273, 274)\n";

  const config = {
    "C Button R": "key(108)",
    "C Button L": "key(106)",
    "C Button D": "key(107)",
    "C Button U": "key(105)",
    "Y Axis": "key(273, 274)"
  }

  const result = updateAutoInputConfig(ini, "Controller2", config);

  const expected = "[FooBar Controller]\n"
                 + "plugged = True\n"
                 + "plugin = 2\n"
                 + "X Axis = key(276, 275)\n"
                 + "Y Axis = key(273, 274)\n"
                 + "\n"
                 + "[Controller2]\n"
                 + "C Button R = key(108)\n"
                 + "C Button L = key(106)\n"
                 + "C Button D = key(107)\n"
                 + "C Button U = key(105)\n"
                 + "Y Axis = key(273, 274)\n";

  expect(result).toEqual(expected);
});
