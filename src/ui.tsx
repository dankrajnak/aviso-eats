import React, { FC } from "react";
import FullScreen from "./fullscreen";
import { Restaurant, StateProvider, User, useRemote, Vote } from "./state";
import TextInput from "ink-text-input";
import { Box, Newline, Text } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import API from "./api";
import Link from "ink-link";
import { Task, TaskList } from "ink-task-list";
import Timer from "./Timer";

const CheckIn = ({
  onCheckedIn,
}: {
  onCheckedIn: (name: string) => unknown;
}) => {
  const [name, setName] = React.useState<string>("");
  const { checkedInUsers, me, setUsername } = useRemote();
  const [errorCheckingIn, setErrorCheckingIn] = React.useState<string | null>(
    null
  );

  const checkIn = async (checkInName: string | null) => {
    setErrorCheckingIn(null);
    if (!checkInName) {
      setErrorCheckingIn("Please provide a name");
      return;
    }
    if (checkedInUsers.map((user) => user.username).includes(checkInName)) {
      setErrorCheckingIn(
        "There's already a user with that username.  You're going to have to pick another one."
      );
      return;
    }
    try {
      await API.checkIn(checkInName);
      onCheckedIn(checkInName);
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : "There was an error checking you in.  Please try again.";
      setErrorCheckingIn(message);
    }
  };

  return (
    <>
      <Box marginBottom={1}>
        <Text>It&lsquo;s time for lunch. Let&lsquo;s check you in.</Text>
      </Box>
      <Box>
        <Text>What&lsquo;s your name? </Text>
        <TextInput
          value={name}
          onChange={setName}
          showCursor={false}
          onSubmit={async () => {
            const username = name || me?.username;
            if (username) {
              await checkIn(username);
              setUsername(username);
            }
          }}
          placeholder={me ? me.username : "Your name"}
        />
      </Box>
      <Box>
        {errorCheckingIn && (
          <Text bold color="red">
            {errorCheckingIn}
          </Text>
        )}
      </Box>
    </>
  );
};

const Option = ({
  option,
  checkedInUsers,
  votes,
}: {
  option: Restaurant;
  checkedInUsers: User[];
  votes: Vote[];
}) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="yellow">
          {option.name}
        </Text>
        <Text bold> (</Text>
        <Text>{new Array(option.price).fill("$").join("")}</Text>
        <Text bold>)</Text>
      </Box>
      <Box>
        <Link url={option.website}>
          <Text italic>{option.website}</Text>
        </Link>
      </Box>
      <Box margin={1}>
        <TaskList>
          {checkedInUsers.map((user) => {
            const vote = votes.find(
              (vote) => vote.username === user.username
            )?.yes;
            let voteStatus: any = "loading";
            switch (vote) {
              case true:
                voteStatus = "success";
                break;

              case false:
                voteStatus = "error";
                break;

              default:
                voteStatus = "loading";
                break;
            }

            return (
              <Task
                state={voteStatus}
                key={user.username}
                label={user.username}
              />
            );
          })}
        </TaskList>
      </Box>
    </Box>
  );
};

const Choose = () => {
  const {
    currentOption,
    checkedInUsers,
    votesForCurrentOption,
    me,
    gracePeriodEnd,
  } = useRemote();

  const [answer, setAnswer] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (currentOption) {
      setSubmitted(false);
    }
  }, [currentOption]);

  if (!currentOption) {
    return null;
  }
  return (
    <Box flexDirection="column">
      <Option
        option={currentOption.restaurant}
        checkedInUsers={checkedInUsers}
        votes={votesForCurrentOption}
      />
      {currentOption.chosen === null && gracePeriodEnd != null && (
        <Text>
          Time remaining: <Timer timeToCountDownTo={gracePeriodEnd} />
        </Text>
      )}
      {!submitted && (
        <Box>
          <Text>Y/N </Text>
          <TextInput
            placeholder="Y"
            value={answer}
            onChange={(change) => {
              if (!change) {
                setAnswer("");
              }
              if (change.toLocaleLowerCase() === "n") {
                setAnswer(change);
              } else if (change.toLocaleLowerCase() === "y") {
                setAnswer(change);
              }
            }}
            onSubmit={() => {
              if (me?.username) {
                API.vote(
                  me.username,
                  currentOption.restaurant.id,
                  ["y", "Y"].includes(answer)
                );
                setSubmitted(true);
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const App: FC = () => {
  const [checkedIn, setIsCheckedIn] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (checkedIn) {
        API.checkOut(checkedIn);
      }
    };
  }, [checkedIn]);

  return (
    <FullScreen>
      <StateProvider>
        {!checkedIn && (
          <>
            <Box marginBottom={1}>
              <Gradient name="retro">
                <BigText text="Aviso Eats" />
              </Gradient>
            </Box>
            <CheckIn onCheckedIn={(name) => setIsCheckedIn(name)} />
          </>
        )}
        {checkedIn && (
          <Box margin={2} flexDirection="column">
            <Box marginBottom={1}>
              <Text>
                Hello, <Text bold>{checkedIn}</Text>,<Newline />
                Thanks for checking in.
              </Text>
            </Box>
            <Choose />
          </Box>
        )}
      </StateProvider>
    </FullScreen>
  );
};

export default App;
