const { createRobot } = require('probot')
const plugin = require('..')

const payload = require('./events/review-submitted')

describe('Config file', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn(),
        getContent: jest.fn().mockReturnValue(Promise.resolve({
          data: {
            content: 'cmV2aWV3Y2hlY2tpbmc6IG5v\n'
          }
        }))
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

  it('Should set the commit status to success if reviewers and commiters check is disabled', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalledWith({
      'context': 'wolfreview',
      'description': 'Reviews are ok',
      'owner': 'user',
      'repo': 'testing-things',
      'sha': 'sha',
      'state': 'success',
      'target_url': 'https://github.com/apps/wolfreview'
    })
  })
})

describe('Config file', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()
    plugin(robot)

    github = {
      repos: {
        createStatus: jest.fn(),
        getContent: jest.fn().mockReturnValue(Promise.resolve({
          data: {
            message: 'Not Found'
          }
        }))
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

  it('Should check reviewers and commiters check if no config file found', async () => {
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
