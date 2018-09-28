const boardEl = document.getElementById("board")

const width = 5;
let boards = Array(width).fill({type: "common"}).map(x => Array(width).fill({type: "common"}))

let adminStatus = true
let ladders = []
let snakes = []

let playerOne = 1
let playerTwo = 1

let playerOneTurn = true

function getCoordinate (num) {
  var coord = {}

  for(var i = boards.length - 1; i >= 0; i--) {
    for(var j = 0; j < boards[i].length; j++) {
      if (boards[i][j].number == num) {
        coord = { row: i, col: j }
        break;
      }
    }
  }

  return coord
}

function isExist (num) {
  for(var i = boards.length - 1; i >= 0; i--) {
    for(var j = 0; j < boards[i].length; j++) {
      if (boards[i][j].number == num) {
        if (boards[i][j].type != "common") {
          return true
        }
      }
    }
  }

  return false
}

function updateBoard () {
  let i = 0

  boards = boards.map((row, idx1) => {
    return row.map((col, idx2) => {
      const num = i
      let type
      // update type start & finish
      if (idx1 == 0 && idx2 == 0) {
        type = "start"
      } else if (idx1 == 4 && idx2 == 4) {
        type = "finish"
      } else {
        type = col.type
      }

      const obj = {
        type: type,
        number: num + 1,
        detail: col.detail
      }
      i++
      return obj
    })
  })
  
}

function renderBoard () {
  boardEl.innerHTML = ""

  for(var i = boards.length - 1; i >= 0; i--) {
    renderRow(i)
    for(var j = 0; j < boards[i].length; j++) {
      renderBox(i, j)
    }
  }
}

function renderRow(row) {
  var div = document.createElement("DIV")
  div.setAttribute("id", "box-" + row)
  if (row % 2 == 0) {
    div.classList.add("row")
  } else {
    div.classList.add("row-reverse")
  }
  
  boardEl.appendChild(div)
}

function renderBox (row, col) {
  const selectedBoard = boards[row][col]
  
  const p1 = document.createElement("DIV")
  p1.classList.add("player1")
  p1.appendChild(document.createTextNode("P1"))
  
  const p2 = document.createElement("DIV")
  p2.classList.add("player2")
  p2.appendChild(document.createTextNode("P2"))

  const parentDiv = document.createElement("DIV")
  const numberDiv = document.createElement("DIV")
  const statusDiv = document.createElement("DIV")
  const typeDiv = document.createElement("DIV")

  statusDiv.classList.add("players")

  // var btn = document.createElement("DIV")
  parentDiv.classList.add("box")
  parentDiv.setAttribute("id", "box-"+row+"-"+col)

  const typeText = selectedBoard.type && selectedBoard.type.toUpperCase()

  if (selectedBoard.type == "start") {
    const text = document.createTextNode(typeText)
    parentDiv.classList.add("start")
    typeDiv.appendChild(text)
  } else if (selectedBoard.type == "finish") {
    const text = document.createTextNode(typeText)
    parentDiv.classList.add("finish")
    typeDiv.appendChild(text)
  }
  if (selectedBoard.type == "ladder-start") {
    const text = document.createTextNode(`ladder to ${selectedBoard.detail.to}`)
    parentDiv.classList.add("ladder-start")
    typeDiv.appendChild(text)
  }
  if (selectedBoard.type == "ladder-end") {
    // const text = document.createTextNode(`ladder end (from: ${selectedBoard.detail.from})`)
    parentDiv.classList.add("ladder-end")
    // typeDiv.appendChild(text)
  }
  if (selectedBoard.type == "snake-start") {
    const text = document.createTextNode(`snake to ${selectedBoard.detail.to}`)
    parentDiv.classList.add("snake-start")
    typeDiv.appendChild(text)
  }
  if (selectedBoard.type == "snake-end") {
    // const text = document.createTextNode(`snake end (from: ${selectedBoard.detail.from})`)
    parentDiv.classList.add("snake-end")
    // typeDiv.appendChild(text)
  }

  if (selectedBoard.hasOwnProperty("number")) {
    const currNumber = selectedBoard.number
    const numberText = document.createTextNode(currNumber)
    numberDiv.appendChild(numberText)
    if (playerOne == currNumber) {
      statusDiv.appendChild(p1)
    }
    if (playerTwo == currNumber) {
      statusDiv.appendChild(p2)
    }
  }

  parentDiv.appendChild(numberDiv)
  parentDiv.appendChild(statusDiv)
  parentDiv.appendChild(typeDiv)

  document.getElementById("box-" + row).appendChild(parentDiv)
}

// challenge LADDER
function determineLadder () {
  if (adminStatus) {
    var ladder = prompt("Please determine ladder | format: [from-to], example: 2-6");

    if (ladder == null || ladder == "") {
        txt = "User cancelled the prompt.";
    } else {
      var spl = ladder.split("-")
      const numStart = Number(spl[0])
      const numEnd = Number(spl[1])
      if (isExist(numStart)) {
        alert(`Kotak ${numStart} telah terpakai`)
      } else if (isExist(numEnd)) {
        alert(`Kotak ${numEnd} telah terpakai`)
      } else if (numStart > numEnd) {
        alert('Awal tangga tidak boleh lebih besar')
      } else if (numStart == numEnd) {
        alert('Awal dan akhir tangga tidak boleh sama')
      }  else if (numStart == 1 || numStart == 25) {
        alert('Awal tangga tidak boleh di Start / Finish')
      } else if (numEnd == 1 || numEnd == 25) {
        alert('Akhir tangga tidak boleh di Start / Finish')
      } else {
        const {row, col} = getCoordinate(numStart)
        boards[row][col].type = "ladder-start"
        boards[row][col].detail = { to: numEnd }
        if (numEnd) {
          const { row: rowEnd, col: colEnd } = getCoordinate(numEnd)
          boards[rowEnd][colEnd].type = "ladder-end"
          boards[rowEnd][colEnd].detail = { from: numEnd }
        }
        ladders.push({from: numStart, to: numEnd})
      }
    }
  }
  renderBoard()
}

function checkLadder (num) {
  const isLadder = ladders.filter(val => val.from == num)
  if (isLadder.length > 0) {
    return isLadder[0].to
  } else {
    return null
  }
}

// challenge SNAKE
function determineSnake () {
  if (adminStatus) {
    var snake = prompt("Please determine snake | format: [from-to], example: 23-7");

    if (snake == null || snake == "") {
        txt = "User cancelled the prompt.";
    } else {
      var spl = snake.split("-")
      const numStart = Number(spl[0])
      const numEnd = Number(spl[1])

      if (isExist(numStart)) {
        alert(`Kotak ${numStart} telah terpakai`)
      } else if (isExist(numEnd)) {
        alert(`Kotak ${numEnd} telah terpakai`)
      } if (numStart < numEnd) {
        alert('Awal ular tidak boleh lebih kecil')
      } else if (numStart == numEnd) {
        alert('Awal dan akhir ular tidak boleh sama')
      } else if (numStart == 1 || numStart == 25) {
        alert('Awal ular tidak boleh di Start / Finish')
      } else if (numEnd == 1 || numEnd == 25) {
        alert('Akhir ular tidak boleh di Start / Finish')
      } else {
        const {row, col} = getCoordinate(numStart)
        boards[row][col].type = "snake-start"
        boards[row][col].detail = { to: numEnd }
        if (numEnd) {
          const { row: rowEnd, col: colEnd } = getCoordinate(numEnd)
          boards[rowEnd][colEnd].type = "snake-end"
          boards[rowEnd][colEnd].detail = { from: numEnd }
        }
        snakes.push({from: numStart, to: numEnd})
      }
    }
  }
  renderBoard()
}

function checkSnake (num) {
  const isSnake = snakes.filter(val => val.from == num)
  if (isSnake.length > 0) {
    return isSnake[0].to
  } else {
    return null
  }
}

function changePlayer () {
  playerOneTurn = !playerOneTurn
  renderBoard()
}

function diceRoll (dice) {
  const steps = typeof(dice) == "string" ? dice : Math.floor(Math.random() * Math.floor(6)) + 1;
  document.getElementById("dice").innerText = steps
  playerTurn(steps)
}

function animate (start, end) {
  // const { row: rowStart, col: colStart } = getCoordinate(start)
  // const { row: rowEnd, col: colEnd } = getCoordinate(end)
  // console.log({rowStart, rowEnd})
  for (var i = start; i < end + 1; i++) {
    const { row, col } = getCoordinate(i)
    const divv = document.createElement("DIV")
    document.getElementById(`box-${row}-${col}`).replaceChild(divv)
    console.log({row, col})
  }
  // for (var i = rowStart; i < rowEnd + 1; i++) {
  //   for (var j = colStart; j < colStart + 1; j++) {
  //     console.log({i, j})
  //   }
  // }
  // document.get
}

function playerTurn (count) {
  const steps = Number(count)
  const start = playerOne
  if (playerOneTurn) {
    playerOne += steps

    console.log({start, playerOne})
    // animate(start, playerOne)
    if (playerOne > 25) {
      playerOne = 25 - (playerOne - 25)
    } else if (playerOne == 25) {
      alert("PLAYER 1 MENANG!")
      gameOver()
    }

    const isLadder = checkLadder(playerOne)
    const isSnake = checkSnake(playerOne)
    if (isLadder) {
      playerOne = isLadder
    } else if (isSnake) {
      playerOne = isSnake
    }
  } else {
    playerTwo += steps
    
    if (playerTwo > 25) {
      playerTwo = 25 - (playerTwo - 25)
    } else if (playerTwo == 25) {
      alert("PLAYER 2 MENANG!")
      gameOver()
    }

    const isLadder = checkLadder(playerTwo)
    const isSnake = checkSnake(playerTwo)
    if (isLadder) {
      playerTwo = destination
    } else if (isSnake) {
      playerTwo = isSnake
    }
  }

  changePlayer()
}

function init () {
  updateBoard()
  renderBoard()
}

function gameOver () {
  // playerOne = 1
  // playerTwo = 1
  // ladders = []
  // snakes = []
  init()
}

function launchCheat () {
  const cheat = document.getElementById("cheat")
  for (var i = 0; i < 6; i++) {
    const btn = document.createElement("BUTTON")
    const idx = i + 1
    btn.appendChild(document.createTextNode(idx))
    btn.classList.add("dice-cheat")
    btn.setAttribute("id", "dice-" + idx)
    btn.addEventListener("click", doCheat)
    cheat.appendChild(btn)
  }
}

function doCheat (e) {
  const id = e.target.id.split("-")
  diceRoll(id[1])
}
//check snake & ladder infinite loop

document.getElementById("selectLadder").addEventListener("click", determineLadder)
document.getElementById("selectSnake").addEventListener("click", determineSnake)
document.getElementById("diceRoll").addEventListener("click", diceRoll)

init()