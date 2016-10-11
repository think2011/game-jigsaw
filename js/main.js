;(function () {
    new Scene1()

    gameWatcher.on('game:play', function () {
        new Scene2()
    })

    gameWatcher.emit('scene:ready')
})()