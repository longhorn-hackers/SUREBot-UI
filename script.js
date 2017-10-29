function onArrival(event) {
    event = event || window.event; // IE
    var target = event.target || event.srcElement; // IE
    var button = target
    if ($(target).is("a")) {
        button = target.parentNode
    }
    button.classList.toggle('picked-up')
    if (!button.classList.contains('picked-up')) {
        button.innerText = 'Dropped-Off'
        button.classList.add('dropped-off')
    } else {
        var card = button.parentNode.parentNode
        $(card).remove()
    }
}

function onVolunteerSignIn(event) {
    event = event || window.event; // IE
    var target = event.target || event.srcElement; // IE
    var loginCard = document.getElementById('volunteerLoginCard')
    console.log(loginCard.style.visibility)
    if ($(loginCard).css('visibility') === 'hidden') {
        loginCard.style.visibility = 'visible'
    }
}