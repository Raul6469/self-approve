const { createRobot } = require('probot')
const plugin = require('..')

const payload = require('./events/review-submitted')

describe('Commit author who approved changes', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn()
      },
      pullRequests: {
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              user: {
                login: 'User1'
              },
              state: 'APPROVED'
            }
          ]
        })),
        getCommits: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              author: {
                login: 'User2'
              }
            },
            {
              author: {
                login: 'User1'
              }
            }
          ]
        }))
      }
    }

    robot.auth = () => Promise.resolve(github)
  })

  it('Should set the commit status to failure', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'wolfreview',
      'description': 'There is a commit author that approved changes',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'failure',
      'target_url': 'https://github.com/apps/wolfreview'
    })
  })
})

describe('Commit author who requested changes', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn()
      },
      pullRequests: {
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              user: {
                login: 'User1'
              },
              state: 'CHANGES_REQUESTED'
            }
          ]
        })),
        getCommits: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              author: {
                login: 'User2'
              }
            },
            {
              author: {
                login: 'User1'
              }
            }
          ]
        }))
      }
    }

    robot.auth = () => Promise.resolve(github)
  })

  it('Should set the commit status to success', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'wolfreview',
      'description': 'Reviews looks ok so far',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/wolfreview'
    })
  })
})

describe('No matching author and positive reviewer', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn()
      },
      pullRequests: {
        getReviews: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              user: {
                login: 'User3'
              },
              state: 'APPROVED'
            }
          ]
        })),
        getCommits: jest.fn().mockReturnValue(Promise.resolve({
          data: [
            {
              author: {
                login: 'User2'
              }
            },
            {
              author: {
                login: 'User1'
              }
            }
          ]
        }))
      }
    }

    robot.auth = () => Promise.resolve(github)
  })

  it('Should set the commit status to success', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'wolfreview',
      'description': 'Reviews looks ok so far',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/wolfreview'
    })
  })
})