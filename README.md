# Parker Rhodes
## Jan 26 2026

## Reflections:
**1.** GetByRole and getByLabelText improve test reliability because what they test can be more easily swapped out for different objects. Additionally, test-ids will not likely be used in production and therefore do not provide much confidence.\
**2.** QueryBy would be used in a situation where we do not know if an element will by present, whereas getBy would be used in a situation where it is expected that a given element will be present.\
**3.** Mocking API calls verifies implementation details but does not provide as much confidence as testing a real backend, as in a production environment the software will be deployed alongside a real backend, not a mock\

## Key Concepts:
**1.** Testing systems that feature a UI increases the complexity of the tests dramatically if we want to be able to test things from a user perspective and not just value-checking and assertions\
**2.** Asynchronous programming and JSON both seem to be very important in the world of Typescript and React\
**3.** Through this lab I feel like my understanding of html has started to improve. I have a basic understanding of it but would not say I have a complete grasp of it.