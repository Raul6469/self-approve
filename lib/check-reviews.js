module.exports = checkReviews

async function checkReviews (robot, context) {
  const pullRequest = {
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    number: context.payload.pull_request.number,
    per_page: 100
  }

  // Setting pending status
  context.github.repos.createStatus(context.repo({
    sha: context.payload.pull_request.head.sha,
    state: 'pending',
    target_url: 'https://github.com/apps/wolfreview',
    description: 'Checking reviews',
    context: 'wolfreview'
  }))

  const reviews = await context.github.pullRequests.getReviews(pullRequest)
  const commits = await context.github.pullRequests.getCommits(pullRequest)

  var authors = []
  var reviewers = {}

  // Getting all the commits authors
  commits.data.forEach(commit => {
    if (!authors.includes(commit.author.login)) {
      authors.push(commit.author.login)
    }
  })

  // Getting all reviews sorted by reviewers
  reviews.data.forEach(review => {
    if (!reviewers.hasOwnProperty(review.user.login)) {
      reviewers[review.user.login] = []
    }
    reviewers[review.user.login].push(review)
  })

  // Checking if there is a commiter that approved the changes
  var commiterAndApprover = false

  authors.forEach(author => {
    if (reviewers.hasOwnProperty(author) && reviewers[author][reviewers[author].length - 1].state === 'APPROVED') {
      commiterAndApprover = true
    }
  })

  // Setting the status accordingly
  context.github.repos.createStatus(context.repo({
    sha: context.payload.pull_request.head.sha,
    state: commiterAndApprover ? 'failure' : 'success',
    target_url: 'https://github.com/apps/wolfreview',
    description: commiterAndApprover ? 'There is a commit author that approved changes' : 'Reviews looks ok so far',
    context: 'wolfreview'
  }))

  commiterAndApprover ? console.log('Status: FAILURE') : console.log('Status: SUCCESS')
}
