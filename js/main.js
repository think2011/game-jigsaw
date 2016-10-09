require.config({
    baseUrl: './js',
    paths  : {
        tools           : 'tools/tools',
        Fastclick       : 'lib/fastclick',
        collisionChecker: 'lib/collisionChecker.min',
        Dragify         : 'lib/Dragify.min',

        game: 'app/game'
    },
    shim   : {},
    map    : {
        '*': {
            'css': 'lib/css.min'
        }
    }
})


require(['game', 'tools'], function (game, tools) {
    new game(window.GAME_PARAMS.items[0])
})