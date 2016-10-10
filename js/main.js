;(function () {
    // new Scene1()

    // new Scene2()

    gameWatcher.on('game:play', function () {
        new Scene2()
    })

    gameWatcher.emit('game:ready')

    // TODO ZH 10/10/16
    gameWatcher.emit('game:play')
})()