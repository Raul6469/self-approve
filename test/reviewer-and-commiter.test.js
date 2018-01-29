const {createRobot} = require('probot')
const plugin = require('..')

const payload = require('./events/review-submitted')

describe('Checking commit authors and reviewers', () => {
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

  it('Should set the commit status to failure if needed', async () => {
    await robot.receive(payload)

    expect(github.repos.createStatus).toHaveBeenCalled()
    expect(github.pullRequests.getReviews).toHaveBeenCalled()
    expect(github.pullRequests.getCommits).toHaveBeenCalled()
  })
})
