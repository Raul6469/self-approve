module.exports = checkReviews

async function checkReviews (context, robot) {
  const pullRequest = {
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    number: context.payload.pull_request.number,
    per_page: 100
  }

  const reviews = await context.github.pullRequests.getReviews(pullRequest)
  const commits = await context.github.pullRequests.getCommits(pullRequest)

  // Getting all the commits authors
  var authors = commitAuthors(commits)

  // Getting all reviews sorted by reviewers
  var reviewers = pullRequestReviewers(reviews)

  // Checking if there is a commiter that approved the changes
  var commiterAndApprover = false

  // Checking, for each commit author, if this user last review was approving changes
  authors.forEach(author => {
    if (reviewers.hasOwnProperty(author) && reviewers[author][reviewers[author].length - 1].state === 'APPROVED') {
      commiterAndApprover = true
    }
  })

  return commiterAndApprover
}

function commitAuthors (commits) {
  var authors = []

  commits.data.forEach(commit => {
    if (!authors.includes(commit.author.login)) {
      authors.push(commit.author.login)
    }
  })
  return authors
}

function pullRequestReviewers (reviews) {
  var reviewers = {}

  reviews.data.forEach(review => {
    if (!reviewers.hasOwnProperty(review.user.login)) {
      reviewers[review.user.login] = []
    }
    reviewers[review.user.login].push(review)
  })

  return reviewers
}
