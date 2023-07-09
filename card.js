const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  // 0-12：黑桃 1-13
  // 13-25：愛心 1-13
  // 26-38：方塊 1-13
  // 39-51：梅花 1-13
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]

    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>`
  },

  getCardElement(index) {

    return `
      <div class="card back" id = '${index}'>
        
      </div>`
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.id))
      } else {
        card.classList.add('back')
        card.innerHTML = null
      }
    })

  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })

  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times.`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => {
        card.classList.remove('wrong')
      }, {
        once: true
      })
    })

  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  // Fisher-Yates Shuffle
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        return
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        view.renderTriedTimes(model.triedTimes += 1)

        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          this.currentState = GAME_STATE.FirstCardAwaits
          model.revealedCards = []

          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  
            return
          }

        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }

        return
    }
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    controller.currentState = GAME_STATE.FirstCardAwaits
    model.revealedCards = []
  }

}

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return Number(this.revealedCards[0].id) % 13 === Number(this.revealedCards[1].id) % 13
  },

  score: 0,

  triedTimes: 0,
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})