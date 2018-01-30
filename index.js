module.exports = probotPlugin

const main = require('./lib/main')

function probotPlugin (robot) {
  robot.on([
    'pull_request.opened',
    'pull_request.synchronize',
    'pull_request_review.submitted',
    'pull_request_review.dismissed'
  ], main.bind(null, robot))
}
