const checkReviews = require('./check-reviews')

module.exports = main

async function main (robot, context) {
  // Setting pending status
  context.github.repos.createStatus(context.repo({
    sha: context.payload.pull_request.head.sha,
    state: 'pending',
    target_url: 'https://github.com/apps/wolfreview',
    description: 'Checking reviews',
    context: 'wolfreview'
  }))

  var commiterAndApprover = await checkReviews(context, robot)

  // Setting the status accordingly
  context.github.repos.createStatus(context.repo({
    sha: context.payload.pull_request.head.sha,
    state: commiterAndApprover ? 'failure' : 'success',
    target_url: 'https://github.com/apps/wolfreview',
    description: commiterAndApprover ? 'There is a commit author that approved changes' : 'Reviews are ok',
    context: 'wolfreview'
  }))

  commiterAndApprover ? robot.log('Status: FAILURE') : robot.log('Status: SUCCESS')
}
