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

  const config = await context.config('wolfreview.yml')

  var statusOk = true

  var commiterAndApprover = false

  if (config && config.reviewchecking === 'yes') {
    commiterAndApprover = await checkReviews(context, robot)
  }

  statusOk = !commiterAndApprover

  // Setting the status accordingly
  context.github.repos.createStatus(context.repo({
    sha: context.payload.pull_request.head.sha,
    state: statusOk ? 'success' : 'failure',
    target_url: 'https://github.com/apps/wolfreview',
    description: statusOk ? 'Reviews are ok' : 'There is a commit author that approved changes',
    context: 'wolfreview'
  }))

  commiterAndApprover ? robot.log('Status: FAILURE') : robot.log('Status: SUCCESS')
}
