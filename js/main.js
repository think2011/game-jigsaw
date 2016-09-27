require.config({
    baseUrl: './js',
    paths  : {
        tools: 'tools/tools',
        Fastclick: 'lib/fastclick',

        game: 'app/game'
    }
})


require(['game', 'tools'], function (game, tools) {
    new game()
})