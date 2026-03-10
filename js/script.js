window.addEventListener("scroll", () => {

const cards = document.querySelectorAll(".card")

cards.forEach(card => {

const position = card.getBoundingClientRect().top

const screen = window.innerHeight

if(position < screen){

card.style.opacity = "1"
card.style.transform = "translateY(0)"

}

})

})
