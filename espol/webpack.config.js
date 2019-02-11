module.exports = {

    entry: './src-React/index.jsx',

    output: {
      path: __dirname + '/public'+ '/js/react/',
      filename: 'bundle.js'
    },

    module: {
      rules:[
        {
          test: /\.jsx$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        }
      ]
    }
}
