require.config({
    baseUrl: './js',
    paths  : {
        tools    : 'tools/tools',
        Fastclick: 'lib/fastclick',

        game: 'app/game'
    },
    shim   : {
    },
    map    : {
        '*': {
            'css': 'lib/css.min'
        }
    }
})


require(['game', 'tools'], function (game, tools) {
    new game()
})