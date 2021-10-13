import React, { FC } from "react";
import { Restaurant, StateProvider, User, useRemote, Vote } from "./state";
import TextInput from "ink-text-input";
import { Box, Newline, Text } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import API from "./api";
import Link from "ink-link";
import { Task, TaskList } from "ink-task-list";
import Timer from "./Timer";
import _ from "lodash";
import FullScreen from "./fullscreen";

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

type OptionStatus = "loading" | "success" | "error";

const Option = ({
  option,
  checkedInUsers,
  votes,
}: {
  option: Restaurant;
  checkedInUsers: User[];
  votes: Vote[];
}) => {
  const list: {
    username: string;
    status: OptionStatus;
  }[] = _.chain(votes)
    .map(({ username, yes }) => ({
      username,
      status: (yes ? "success" : "error") as OptionStatus,
    }))
    .unionWith(
      checkedInUsers.map(
        ({ username }) =>
          ({ username: username, status: "loading" as OptionStatus } || [])
      ),
      (a, b) => a.username === b.username
    )
    .sortBy("username")
    .value();

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
          {list.map((option) => {
            return (
              <Task
                state={option.status}
                key={option.username}
                label={option.username}
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
  const voteForCurrentUser = votesForCurrentOption.find(
    ({ username }) => username === me?.username
  );

  if (!currentOption) {
    return null;
  }
  if (currentOption.chosen) {
    return (
      <PickedOption
        chosenOption={currentOption.restaurant}
        votesForOption={votesForCurrentOption}
      />
    );
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
      {!voteForCurrentUser && (
        <Box marginTop={1}>
          <Text bold>Y/N </Text>
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
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

const PickedOption: FC<{
  chosenOption: Restaurant;
  votesForOption: Vote[];
}> = ({ chosenOption, votesForOption }) => {
  const thoseInFavor = votesForOption.filter((vote) => vote.yes);
  const thoseOpposed = votesForOption.filter((vote) => !vote.yes);

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>WE HAVE A WINNER!</Text>
      </Box>
      <Box>
        <Gradient name="cristal">
          <BigText text={chosenOption.name} />
        </Gradient>
      </Box>
      <Box flexDirection="column">
        <Text bold color="green">
          Those In Favor
        </Text>
        {thoseInFavor.length ? (
          thoseInFavor.map(({ username }) => (
            <Text color="green" key={username}>
              {username}
            </Text>
          ))
        ) : (
          <Text>(No one)</Text>
        )}
        <Newline />
        <Text bold color="red">
          Those Opposed
        </Text>
        {thoseOpposed.length ? (
          thoseOpposed.map(({ username }) => (
            <Text color="red" key={username}>
              {username}
            </Text>
          ))
        ) : (
          <Text>(No one)</Text>
        )}
      </Box>
    </Box>
  );
};

const VersionCheck: FC = ({ children }) => {
  const { wrongVersion } = useRemote();
  if (wrongVersion) {
    return (
      <Box flexDirection="column">
        <Text>
          There&lsquo;s a newer version of aviso-eats. To install, run{" "}
        </Text>
        <Box margin={1}>
          <Text bold>npm i -g aviso-eats</Text>
        </Box>
      </Box>
    );
  }
  return <>{children}</>;
};

const ConnectionCheck: FC = ({ children }) => {
  const { isDefault } = useRemote();
  if (isDefault) {
    return (
      <Box margin={1}>
        <Text>Connecting to server...</Text>
      </Box>
    );
  }
  return <>{children}</>;
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
        <ConnectionCheck>
          <VersionCheck>
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
                <Choose />
              </Box>
            )}
          </VersionCheck>
        </ConnectionCheck>
      </StateProvider>
    </FullScreen>
  );
};

export default App;
