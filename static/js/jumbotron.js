var index = 0, words = ["simple.", "enjoyable.", "stress-free.", "better.", "organized.", "sociable.", "productive."];

function loop() {
    if (index >= words.length)
        index = 0;
    $('#words').html(words[index++]);
    $('#words')
        .fadeIn('slow').animate({opacity: 1.0}, 2000).fadeOut('slow',
        function() {
            return loop()
        }
    );
}
loop();
