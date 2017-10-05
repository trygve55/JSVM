var opcodes = [];
var rom = Array(getRomSize()).fill(0);
var ram = Array(getRamSize()).fill(0);
var reg = Array(2).fill(0);
var inIO = 0;
var outIO = 0;
var programCounter = 0;
var lastProgramCounter = 0;
var totalCycles = 0;
var highLighed = [];

function getRomSize() {
  return 16;
}

function getRamSize() {
  return 8;
}

function getFib() {
  var program = ['ee', 'ff', '20', '80', '30', '80', '50', '80', 'd0', '50', '80', '10', 'b5', '00', '00', '01'];
  for (var i = 0;i < getRomSize();i++) {
    $("#romHex" + i).val(program[i]);
    rom[i] = parseInt(program[i], 16);
  }
}

function getDesc(i) {
  var opcode = i >>> 4;
  var data = i & 15;

  var string = "";

  switch (opcode) {
    case 0:

      break;
    //LOADR2
    case 1:
      string = "Loads data from RAM adress " + decToHex(data) + " and places it in registery 2.";
      break;
    //STORER1
    case 2:
      string = "Stores the data in regiser 1 to RAM adress " + decToHex(data) + ".";
      break;
    //STORER2
    case 3:
      string = "Stores the data in regiser 2 to RAM adress " + decToHex(data) + ".";
      break;
    case 4:

      break;
    //ADD
    case 5:
      string = "Adds the values in regiser 1 and 2 together and stores the result on RAM adress " + decToHex(data)+ ".";
      break;
    case 6:

      break;
    case 7:

      break;
    //PUSHIO
    case 8:
      string = "Pushes data from RAM adress " + decToHex(data) + " and places it in the output pins (regiser)."
      break;
    //PULLIO
    case 9:
      string = "Pulls data from the input pins (regiser) and places it at RAM adress " + decToHex(data) + "."
      break;
    case 10:

      break;
    //GOTOROM
    case 11:
      string = "Sets the program counter to ROM adress " + decToHex(data) + ". The next executed instruction will be " + decToHex(data + 1) + ".";
      break;
    case 12:

      break;
    //LOADR1
    case 13:
      string = "Loads data from RAM adress " + decToHex(data) + " and places it in registery 1.";
      break;
    //LOADROMR1
    case 14:
      string = "Loads data from ROM adress " + decToHex(data) + " and places it in registery 1.";
      break;
    //LOADROMR2
    case 15:
      string = "Loads data from ROM adress " + decToHex(data) + " and places it in registery 2.";
      break;
    default:
  }

  return string;
}

function updateRomText(i) {
  rom[i] = parseInt($("#romHex"+ i).val(), 16);
  updateText();
}

function updateText() {
  //ROM
  for (var i = 0;i < getRomSize();i++) {
    var dec = rom[i];
    $("#romBin" + i).html(binaryToString(dec));
    $("#romDec" + i).html(dec);
    $("#romDisc" + i).html(getDesc(dec));
  }

  //RAM
  for (var i = 0;i < getRamSize();i++) {
    var dec = ram[i];
    $("#ramBin" + i).html(binaryToString(dec));
    $("#ramHex" + i).html(decToHex(dec));
    $("#ramDec" + i).html(dec);
  }

  $("#regBin0").html(binaryToString(reg[0]));
  $("#regBin1").html(binaryToString(reg[1]));
  $("#regHex0").html(decToHex(reg[0]));
  $("#regHex1").html(decToHex(reg[1]));
  $("#regDec0").html(reg[0]);
  $("#regDec1").html(reg[1]);

  $("#outBin").html(binaryToString(outIO));
  $("#inBin").html(binaryToString(inIO));
  $("#outHex").html(decToHex(outIO));
  $("#inHex").html(decToHex(inIO));
  $("#outDec").html(outIO);
  $("#inDec").html(inIO);

  $("#programCounter").html(programCounter);
  $("#programCounterHex").html(decToHex(programCounter));
  $("#totalCycles").html(totalCycles);

  $("#romRow" + lastProgramCounter).css("background-color", "");
  $("#romRow" + programCounter).css("background-color", "#fcaeae");

  i = rom[programCounter];
  var opcode = i >>> 4;
  var data = i & 15;

  for (var i = 0;i < highLighed.length;i++) {
    highLighed.pop().css("background-color", "");
  }

  if (opcode >= 14) {
    $("#romRow" + data).css("background-color", "#9bb1ff");
    highLighed.push($("#romRow" + data));
  } else if(opcode == 11) {
    $("#romRow" + (data + 1)).css("background-color", "#9bb1ff");
  } else {
    //RAM
    $("#ramRow" + data).css("background-color", "#9bb1ff");
    highLighed.push($("#ramRow" + data));
  }

  if (opcode >= 13 || opcode <= 7) {
    //reg
    if (opcode == 6) {
      $("#regRow0").css("background-color", "#9bb1ff");
      highLighed.push($("#regRow0"));
      $("#regRow1").css("background-color", "#9bb1ff");
      highLighed.push($("#regRow1"));
    } else if (opcode == 13 || opcode == 14 || opcode == 2) {
      $("#regRow0").css("background-color", "#9bb1ff");
      highLighed.push($("#regRow0"));
    } else {
      $("#regRow1").css("background-color", "#9bb1ff");
      highLighed.push($("#regRow1"));
    }
  }

  if (opcode == 8 || opcode == 9) {
          //I/O
    if (opcode == 8) {
      $("#outRow").css("background-color", "#9bb1ff");
      highLighed.push($("#outRow"));
    } else {
      $("#inRow").css("background-color", "#9bb1ff");
      highLighed.push($("#inRow"));
    }
  }
}

function binaryToString(dec) {
  var s = dec.toString(2);
  if (s == "NaN") s = "0";
  while (s.length < 8) s = "0" + s;
  s = s.substring(0,4) + " " + s.substring(4, 8);
  return s;
}

function decToHex(dec) {
  var s = dec.toString(16);
  while (s.length < 2) s = "0" + s;
  return s;
}

function runInstruction() {
  var opcode = rom[programCounter] >>> 4;
  var data = rom[programCounter] & 15;

  lastProgramCounter = programCounter;

  switch (opcode) {
    case 0:

      break;
    //LOADR2
    case 1:
      reg[1] = ram[data];
      break;
    //STORER1
    case 2:
      ram[data] = reg[0];
      break;
    //STORER2
    case 3:
      ram[data] = reg[1];
      break;
    case 4:

      break;
    //ADD
    case 5:
      ram[data] = (reg[0] + reg[1]) % 256;
      break;
    case 6:

      break;
    case 7:

      break;
    //PUSHIO
    case 8:
      outIO = ram[data];
      break;
    //PULLIO
    case 9:
      ram[data] = inIO;
      break;
    case 10:

      break;
    //GOTOROM
    case 11:
      programCounter = data;
      break;
    case 12:

      break;
    //LOADR1
    case 13:
      reg[0] = ram[data];
      break;
    //LOADROMR1
    case 14:
      reg[0] = rom[data];
      break;
    //LOADROMR2
    case 15:
      reg[1] = rom[data];
      break;
    default:

  }

  programCounter++;
  totalCycles++;

  updateText();
}

$(document).ready(function() {
  for (var i = 0; i < getRomSize();i++) {
    $("#rom").append(
      "<div id='romRow"+i+"' style='' class='row'> " +
        "<div class='col-xs-1'>" +
          decToHex(i) +
        "</div>" +
        "<div class='col-sm-1'>" +
          "<input data-id="+i+" id='romHex"+i+"' type='text' maxlength=2 size=2></input>" +
        "</div>" +
        "<div class='col-sm-1'>" +
          "<text id='romBin"+i+"'></text>" +
        "</div>" +
        "<div class='col-sm-1'>" +
          "<text id='romDec"+i+"'></text>" +
        "</div>" +
        "<div class='col-sm-8'>" +
          "<text id='romDisc"+i+"'></text>" +
        "</div>" +
      "</div>");

    $("#romHex"+ i).on('keyup', function() {
      updateRomText($(this).data('id'));
    });
  }

  for (var i = 0; i < getRamSize();i++) {
    $("#ram").append(
      "<div id='ramRow"+i+"' class='row'> " +
        "<div class='col-xs-3'>" +
          decToHex(i) +
        "</div>" +
        "<div class='col-xs-3'>" +
          "<text id='ramHex"+i+"'></text>" +
        "</div>" +
        "<div class='col-xs-3'>" +
          "<text id='ramBin"+i+"'></text>" +
        "</div>" +
        "<div class='col-xs-3'>" +
          "<text id='ramDec"+i+"'></text>" +
        "</div>" +
      "</div>"
    );
    updateText(i);
  }

  for (var i = 0; i < 2;i++) {
    $("#reg").append(
      "<div id='regRow"+i+"' class='row'> " +
        "<div class='col-xs-3'>Reg: " + (i + 1) + "</div>" +
        "<div class='col-xs-3'>" +
          "<text id='regHex"+i+"'>00</text>" +
        "</div>" +
        "<div class='col-xs-3'>" +
          "<text id='regBin"+i+"'>0000 0000</text>" +
        "</div>" +
        "<div class='col-xs-3'>" +
          "<text id='regDec"+i+"'>0</text>" +
        "</div>" +
      "</div>"
    );
  }

  $("#runInstruction").click(function() {
    runInstruction();
  });

  $("#runMoreInstruction").click(function() {
    setInterval(function() {
      runInstruction();
    }, 500)
  });

  var popover = "";
  for (var i = 0;i < 16;i++) {
    popover += "<div class='row'><div class='col-xs-2'>" + decToHex(i) + ":</div><div class='col-xs-10'>" + getDesc(i << 4) + "</div></div>";
  }


  $("#opcodesPopover").data('content', popover);
  $('[data-toggle="popover"]').popover({
    html:true
  });

  getFib();
  updateText(i);
});
