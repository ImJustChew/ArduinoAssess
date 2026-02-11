// Cleaned seed script aligned with eBricks-AI Chapters 0-6 curriculum
// Run with: bun run server/db/seed-questions-clean.ts

import { db } from './client';
import { questionBank } from './drizzle-schema';
import { eq, and } from 'drizzle-orm';
import type { Dimension, DifficultyLevel } from '../../frontend/src/types';

interface SeedQuestion {
  dimension: string;
  difficulty: number;
  questionType: 'multiple_choice' | 'one_liner' | 'code_ide' | 'trace';
  questionData: {
    prompt: string;
    type: string;
    choices?: string[];
    correctChoiceIndex?: number;
    expectedAnswer?: string;
    codeToTrace?: string;
    traceQuestion?: string;
    traceAnswer?: string;
    chatbotPersona?: string;
    chatbotProblem?: string;
    chatbotSolution?: string;
    tags: string[];
  };
}

const seedQuestions: SeedQuestion[] = [
  // ============ LOW LEVEL BINARY - Difficulty 2 ============
  {
    dimension: 'low_level',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'In Arduino, what does the constant HIGH represent?',
      type: 'multipleChoice',
      choices: ['0', '1', '5', '255'],
      correctChoiceIndex: 1,
      tags: ['digital', 'constants', 'basic'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 2,
    questionType: 'one_liner',
    questionData: {
      prompt: 'What is the decimal value of the binary number 1010?',
      type: 'oneLiner',
      expectedAnswer: '10',
      tags: ['binary', 'conversion', 'basic'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 2,
    questionType: 'one_liner',
    questionData: {
      prompt: 'What is the decimal value of the binary number 1111?',
      type: 'oneLiner',
      expectedAnswer: '15',
      tags: ['binary', 'conversion', 'basic'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 2,
    questionType: 'one_liner',
    questionData: {
      prompt: 'Convert binary 11111111 to decimal.',
      type: 'oneLiner',
      expectedAnswer: '255',
      tags: ['binary', 'conversion', 'basic'],
    },
  },

  // ============ LOW LEVEL BINARY - Difficulty 3 ============
  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What range of values does analogRead() return when reading from an analog pin?',
      type: 'multipleChoice',
      choices: ['0-255', '0-1023', '0-5', '0-100'],
      correctChoiceIndex: 1,
      tags: ['analog', 'adc', 'range'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'one_liner',
    questionData: {
      prompt: 'What does Serial.println(13, BIN) output?',
      type: 'oneLiner',
      expectedAnswer: '1101',
      tags: ['serial', 'binary', 'output'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'one_liner',
    questionData: {
      prompt: 'What is the binary representation of decimal 16?',
      type: 'oneLiner',
      expectedAnswer: '10000',
      tags: ['binary', 'conversion'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What does INPUT_PULLUP do when configuring a button pin?',
      type: 'multipleChoice',
      choices: [
        'Makes the pin output HIGH',
        'Enables internal resistor so pin reads HIGH when not pressed',
        'Pulls the button physically',
        'Increases voltage to the pin',
      ],
      correctChoiceIndex: 1,
      tags: ['pullup', 'input', 'hardware'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What data type should be used to store the result of millis()?',
      type: 'multipleChoice',
      choices: ['int', 'bool', 'unsigned long', 'float'],
      correctChoiceIndex: 2,
      tags: ['millis', 'data-types', 'timing'],
    },
  },

  // ============ LOW LEVEL BINARY - Difficulty 4 ============
  {
    dimension: 'low_level',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'If analogRead(A0) returns 512, approximately what voltage is on pin A0? (Arduino runs at 5V)',
      type: 'multipleChoice',
      choices: ['1.25V', '2.5V', '3.75V', '5V'],
      correctChoiceIndex: 1,
      tags: ['analog', 'voltage', 'calculation'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'The Arduino ADC is 10-bit. What does this mean?',
      type: 'multipleChoice',
      choices: [
        'It can read 10 different voltage levels',
        'It can read 1024 (2^10) different levels from 0-5V',
        'It uses 10 wires',
        'It takes 10 milliseconds to read',
      ],
      correctChoiceIndex: 1,
      tags: ['adc', 'resolution', 'analog'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What is the difference between flash memory and SRAM on Arduino UNO?',
      type: 'multipleChoice',
      choices: [
        'Flash stores the program (32KB), SRAM stores variables during runtime (2KB)',
        'Flash is faster than SRAM',
        'SRAM stores the program, Flash stores variables',
        'They are the same thing',
      ],
      correctChoiceIndex: 0,
      tags: ['memory', 'architecture', 'hardware'],
    },
  },

  // ============ CONTROL FLOW - Difficulty 2 ============
  {
    dimension: 'control_flow',
    difficulty: 2,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print to the Serial Monitor?',
      type: 'trace',
      codeToTrace: `int x = 5;
void setup() {
  Serial.begin(9600);
  if (x > 3) {
    Serial.println("Big");
  } else {
    Serial.println("Small");
  }
}
void loop() {}`,
      traceQuestion: 'What is printed?',
      traceAnswer: 'Big',
      tags: ['if-else', 'conditions', 'basic'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Which operator checks if two values are equal?',
      type: 'multipleChoice',
      choices: ['=', '==', '!=', '>='],
      correctChoiceIndex: 1,
      tags: ['operators', 'comparison', 'syntax'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 2,
    questionType: 'one_liner',
    questionData: {
      prompt: 'What symbol is used to compare if two values are NOT equal?',
      type: 'oneLiner',
      expectedAnswer: '!=',
      tags: ['operators', 'comparison', 'syntax'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What does the ++ operator do to a variable?',
      type: 'multipleChoice',
      choices: [
        'Doubles the value',
        'Increases it by 1',
        'Makes it positive',
        'Adds 10',
      ],
      correctChoiceIndex: 1,
      tags: ['operators', 'increment', 'basic'],
    },
  },

  // ============ CONTROL FLOW - Difficulty 3 ============
  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'trace',
    questionData: {
      prompt: 'What are the first 5 numbers this code prints?',
      type: 'trace',
      codeToTrace: `void setup() {
  Serial.begin(9600);
  for (int i = 2; i <= 10; i += 2) {
    Serial.println(i);
  }
}
void loop() {}`,
      traceQuestion: 'List the first 5 numbers printed (comma separated)',
      traceAnswer: '2, 4, 6, 8, 10',
      tags: ['for-loop', 'increment', 'trace'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What does the following condition check?\n\nif (x > 10 && y < 5)',
      type: 'multipleChoice',
      choices: [
        'x is greater than 10 OR y is less than 5',
        'x is greater than 10 AND y is less than 5',
        'x is greater than 10 but not y is less than 5',
        'x equals 10 and y equals 5',
      ],
      correctChoiceIndex: 1,
      tags: ['logical-operators', 'and', 'conditions'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print?',
      type: 'trace',
      codeToTrace: `int x = 10;
void setup() {
  Serial.begin(9600);
  if (x > 5 && x < 15) {
    Serial.println("In range");
  } else {
    Serial.println("Out of range");
  }
}
void loop() {}`,
      traceQuestion: 'What is printed?',
      traceAnswer: 'In range',
      tags: ['logical-operators', 'and', 'conditions'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'Why do we need a previousState variable when reading buttons?',
      type: 'multipleChoice',
      choices: [
        'To store the button pin number',
        'To compare with currentState and detect state changes',
        'To count how many times button was pressed',
        'previousState is not needed',
      ],
      correctChoiceIndex: 1,
      tags: ['state-tracking', 'button', 'edge-detection'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What is the difference between while and for loops?',
      type: 'multipleChoice',
      choices: [
        'while runs faster',
        'for loops have built-in initialization, condition, and increment',
        'while loops can only run once',
        'No difference, they are the same',
      ],
      correctChoiceIndex: 1,
      tags: ['loops', 'while', 'for'],
    },
  },

  // ============ CONTROL FLOW - Difficulty 4 ============
  {
    dimension: 'control_flow',
    difficulty: 4,
    questionType: 'trace',
    questionData: {
      prompt: 'What is the output of this code after it runs for 3 iterations?',
      type: 'trace',
      codeToTrace: `int counter = 0;
void setup() {
  Serial.begin(9600);
}
void loop() {
  counter++;
  Serial.println(counter);
  if (counter >= 3) {
    while(true); // Stop
  }
}`,
      traceQuestion: 'What numbers are printed? (comma separated)',
      traceAnswer: '1, 2, 3',
      tags: ['loop', 'counter', 'state'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 4,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this nested loop code print?',
      type: 'trace',
      codeToTrace: `void setup() {
  Serial.begin(9600);
  for (int i = 1; i <= 2; i++) {
    for (int j = 1; j <= 3; j++) {
      Serial.print(i * j);
      Serial.print(" ");
    }
  }
}
void loop() {}`,
      traceQuestion: 'What is printed? (include spaces)',
      traceAnswer: '1 2 3 2 4 6',
      tags: ['nested-loops', 'trace', 'multiplication'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 4,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print?',
      type: 'trace',
      codeToTrace: `int count = 0;
void setup() {
  Serial.begin(9600);
  while (count < 3) {
    Serial.println(count);
    count++;
  }
}
void loop() {}`,
      traceQuestion: 'What numbers are printed? (comma separated)',
      traceAnswer: '0, 1, 2',
      tags: ['while-loop', 'trace', 'counter'],
    },
  },
  {
    dimension: 'control_flow',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What does the modulo operator % do in this code?\n\nif (count % 2 == 0)',
      type: 'multipleChoice',
      choices: [
        'Divides count by 2',
        'Checks if count is even (divisible by 2 with no remainder)',
        'Multiplies count by 2',
        'Calculates percentage',
      ],
      correctChoiceIndex: 1,
      tags: ['modulo', 'operators', 'even-odd'],
    },
  },

  // ============ HARDWARE IO - Difficulty 2 ============
  {
    dimension: 'hardware_io',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Which function configures a pin as an output?',
      type: 'multipleChoice',
      choices: [
        'digitalWrite(pin, OUTPUT)',
        'pinMode(pin, OUTPUT)',
        'analogWrite(pin, OUTPUT)',
        'setOutput(pin)',
      ],
      correctChoiceIndex: 1,
      tags: ['pinMode', 'output', 'setup'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 2,
    questionType: 'one_liner',
    questionData: {
      prompt:
        'What function turns an LED on pin 7 ON? (Write the complete function call)',
      type: 'oneLiner',
      expectedAnswer: 'digitalWrite(7, HIGH)',
      tags: ['digitalWrite', 'LED', 'output'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What does delay(1000) do?',
      type: 'multipleChoice',
      choices: [
        'Waits 1 second',
        'Waits 1 millisecond',
        'Waits 1 minute',
        'Turns off for 1 second',
      ],
      correctChoiceIndex: 0,
      tags: ['delay', 'timing', 'basic'],
    },
  },

  // ============ HARDWARE IO - Difficulty 3 ============
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'You wire a button with INPUT_PULLUP. What does digitalRead() return when the button is PRESSED?',
      type: 'multipleChoice',
      choices: ['HIGH', 'LOW', '1023', '0 or 1 randomly'],
      correctChoiceIndex: 1,
      tags: ['digitalRead', 'pullup', 'button'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What is the purpose of the delay() function?',
      type: 'multipleChoice',
      choices: [
        'To pause the program for a specified number of seconds',
        'To pause the program for a specified number of milliseconds',
        'To speed up the program execution',
        'To turn off all LEDs',
      ],
      correctChoiceIndex: 1,
      tags: ['delay', 'timing', 'blocking'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What range of values can you write with analogWrite()?',
      type: 'multipleChoice',
      choices: ['0-1023', '0-255', '0-100', '0-5'],
      correctChoiceIndex: 1,
      tags: ['analogWrite', 'pwm', 'range'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'To dim an LED gradually (not just ON/OFF), which function should you use?',
      type: 'multipleChoice',
      choices: [
        'digitalWrite()',
        'analogWrite() with PWM',
        'digitalRead()',
        'Serial.println()',
      ],
      correctChoiceIndex: 1,
      tags: ['pwm', 'analogWrite', 'dimming'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'one_liner',
    questionData: {
      prompt: 'What function reads the voltage on analog pin A0?',
      type: 'oneLiner',
      expectedAnswer: 'analogRead(A0)',
      tags: ['analog', 'input', 'functions'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Which pins on Arduino UNO support PWM (analogWrite)?',
      type: 'multipleChoice',
      choices: [
        'All digital pins',
        'Pins marked with ~ symbol (3, 5, 6, 9, 10, 11)',
        'Only pin 13',
        'All analog pins',
      ],
      correctChoiceIndex: 1,
      tags: ['pwm', 'pins', 'hardware'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the purpose of checking (currentState == 1 && previousState == 0) for button input?',
      type: 'multipleChoice',
      choices: [
        'To detect when button is held down',
        'To detect the rising edge (button press moment)',
        'To check if button is broken',
        'To make the button work faster',
      ],
      correctChoiceIndex: 1,
      tags: ['edge-detection', 'debouncing', 'button'],
    },
  },

  // ============ HARDWARE IO - Difficulty 4 ============
  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'Why might a button register multiple presses when pressed once?',
      type: 'multipleChoice',
      choices: [
        'The button is broken',
        'Button bounce - mechanical contacts vibrate',
        'The code runs too fast',
        'The pull-up resistor is too strong',
      ],
      correctChoiceIndex: 1,
      tags: ['debouncing', 'button', 'hardware'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the advantage of using millis() over delay() for timing?',
      type: 'multipleChoice',
      choices: [
        'millis() is more accurate',
        'millis() does not block code execution, allowing other tasks',
        'millis() uses less power',
        'delay() is deprecated',
      ],
      correctChoiceIndex: 1,
      tags: ['millis', 'non-blocking', 'timing'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'In the LED shifter code, what does the DEBOUNCE_DELAY prevent?',
      type: 'multipleChoice',
      choices: [
        'LED from burning out',
        'Multiple state changes from one physical button press',
        'Button from getting stuck',
        'LEDs from turning off',
      ],
      correctChoiceIndex: 1,
      tags: ['debouncing', 'button-bounce', 'hardware'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the purpose of using millis() instead of delay() in the blink without delay pattern?',
      type: 'multipleChoice',
      choices: [
        'millis() is more accurate',
        'Allows other code to run while timing, non-blocking',
        'millis() uses less power',
        'delay() is deprecated',
      ],
      correctChoiceIndex: 1,
      tags: ['millis', 'non-blocking', 'timing'],
    },
  },

  // ============ CODE READING - Difficulty 2 ============
  {
    dimension: 'code_reading',
    difficulty: 2,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this LED blinking code do?',
      type: 'trace',
      codeToTrace: `void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      traceQuestion: 'How many times per second does the LED toggle on/off?',
      traceAnswer: '1',
      tags: ['blink', 'trace', 'timing'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What is wrong with this line of code?\n\nint x = 5',
      type: 'multipleChoice',
      choices: [
        'Missing semicolon',
        'Wrong variable type',
        'x should be capitalized',
        'Nothing is wrong',
      ],
      correctChoiceIndex: 0,
      tags: ['syntax', 'semicolon', 'error'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 2,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print?',
      type: 'trace',
      codeToTrace: `void setup() {
  Serial.begin(9600);
  int sum = 5 + 3;
  Serial.println(sum);
}
void loop() {}`,
      traceQuestion: 'What is printed?',
      traceAnswer: '8',
      tags: ['arithmetic', 'variables', 'basic'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'You try to upload code but get "error: expected \';\' before \'}\' token". What is the likely cause?',
      type: 'multipleChoice',
      choices: [
        'Missing semicolon at the end of a statement',
        'Wrong variable name',
        'Upload port not selected',
        'Arduino board not connected',
      ],
      correctChoiceIndex: 0,
      tags: ['compile-error', 'syntax', 'ide'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'The Arduino IDE shows "avrdude: ser_open(): cannot open device". What does this mean?',
      type: 'multipleChoice',
      choices: [
        'Code has syntax errors',
        'Wrong COM port selected or cable not connected',
        'Not enough memory on Arduino',
        'Code is too long',
      ],
      correctChoiceIndex: 1,
      tags: ['upload-error', 'port', 'ide'],
    },
  },

  // ============ CODE READING - Difficulty 3 ============
  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print?',
      type: 'trace',
      codeToTrace: `int a = 1;
void setup() {
  Serial.begin(9600);
  Serial.println(a);
  a = a + 1;
  Serial.println(a);
}
void loop() {}`,
      traceQuestion: 'What two numbers are printed? (comma separated)',
      traceAnswer: '1, 2',
      tags: ['variables', 'reassignment', 'trace'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What does this code calculate?\n\nint result = (5 + 3) * 2;',
      type: 'multipleChoice',
      choices: ['11', '16', '13', '26'],
      correctChoiceIndex: 1,
      tags: ['arithmetic', 'operators', 'math'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print after all iterations?',
      type: 'trace',
      codeToTrace: `int x = 0;
int y = 5;
void setup() {
  Serial.begin(9600);
  x = x + y;
  y = y - 2;
  Serial.print(x);
  Serial.print(",");
  Serial.println(y);
}
void loop() {}`,
      traceQuestion: 'What is the output? (format: x,y)',
      traceAnswer: '5,3',
      tags: ['variables', 'arithmetic', 'trace'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What will this code do?\n\nint led = 13;\nvoid setup() {\n  pinMode(led, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(led, HIGH);\n}',
      type: 'multipleChoice',
      choices: [
        'LED blinks',
        'LED stays on continuously',
        'LED stays off',
        'LED fades',
      ],
      correctChoiceIndex: 1,
      tags: ['led', 'digitalWrite', 'trace'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'trace',
    questionData: {
      prompt: 'What does this code print?',
      type: 'trace',
      codeToTrace: `void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) {
    if (i == 2) {
      continue;
    }
    Serial.println(i);
  }
}
void loop() {}`,
      traceQuestion: 'What numbers are printed? (comma separated)',
      traceAnswer: '0, 1, 3, 4',
      tags: ['for-loop', 'continue', 'control-flow'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Error: "a function-definition is not allowed here before opening brace token". What is wrong?',
      type: 'multipleChoice',
      choices: [
        'You defined a function inside another function (like inside loop())',
        'Missing void keyword',
        'Function has no return type',
        'Curly braces are backwards',
      ],
      correctChoiceIndex: 0,
      tags: ['compile-error', 'functions', 'scope'],
    },
  },

  // ============ CODE READING - Difficulty 4 ============
  {
    dimension: 'code_reading',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the issue with this code?\n\nint temp = 36.5;\nif (temp > 37) { Serial.println("Fever"); }',
      type: 'multipleChoice',
      choices: [
        'Nothing wrong',
        'Integer truncation - 36.5 becomes 36',
        'temp should be a string',
        'Missing semicolon',
      ],
      correctChoiceIndex: 1,
      tags: ['types', 'truncation', 'bugs'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'What does this boolean expression evaluate to?\n\nbool result = (5 > 3) || (2 > 10);',
      type: 'multipleChoice',
      choices: ['true', 'false', 'error', 'undefined'],
      correctChoiceIndex: 0,
      tags: ['boolean', 'or', 'logic'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 4,
    questionType: 'trace',
    questionData: {
      prompt: 'What is the final value of x?',
      type: 'trace',
      codeToTrace: `int x = 5;
void setup() {
  x = x * 2;
  x = x + 3;
  x = x / 2;
}
void loop() {}`,
      traceQuestion: 'What is the final value of x?',
      traceAnswer: '6',
      tags: ['arithmetic', 'operations', 'trace'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the value of result after this code runs?\n\nbool a = true;\nbool b = false;\nbool result = a && b || !b;',
      type: 'multipleChoice',
      choices: ['true', 'false', 'compile error', 'undefined'],
      correctChoiceIndex: 0,
      tags: ['boolean', 'logic', 'operators'],
    },
  },
  {
    dimension: 'code_reading',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Code compiles but Serial Monitor shows garbage characters. What are likely causes?',
      type: 'multipleChoice',
      choices: [
        'Code has bugs',
        'Baud rate mismatch between Serial.begin() and Serial Monitor settings',
        'Arduino is broken',
        'USB cable is faulty',
      ],
      correctChoiceIndex: 1,
      tags: ['serial', 'baud-rate', 'debugging'],
    },
  },

  // ============ DECOMPOSITION - Difficulty 2 ============
  {
    dimension: 'decomposition',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the first step to make an LED blink in Arduino code?',
      type: 'multipleChoice',
      choices: [
        'Call digitalWrite()',
        'Set up pinMode() in setup()',
        'Call delay()',
        'Print to Serial',
      ],
      correctChoiceIndex: 1,
      tags: ['planning', 'setup', 'sequence'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'Where should you place pinMode() statements in Arduino code?',
      type: 'multipleChoice',
      choices: [
        'In loop() so it runs repeatedly',
        'In setup() to configure once at startup',
        'Before setup() and loop()',
        'pinMode() is not needed',
      ],
      correctChoiceIndex: 1,
      tags: ['setup', 'initialization', 'structure'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Before uploading code to Arduino, what two things must you select in the IDE?',
      type: 'multipleChoice',
      choices: [
        'File and Folder',
        'Board type and Port (COM port)',
        'Language and Theme',
        'Code and Upload Speed',
      ],
      correctChoiceIndex: 1,
      tags: ['ide-setup', 'board', 'port'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 2,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'To make an LED blink, which two functions are essential in loop()?',
      type: 'multipleChoice',
      choices: [
        'pinMode and Serial.begin',
        'digitalWrite and delay',
        'analogWrite and digitalRead',
        'setup and loop',
      ],
      correctChoiceIndex: 1,
      tags: ['blink', 'planning', 'basic'],
    },
  },

  // ============ DECOMPOSITION - Difficulty 3 ============
  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'You want to count button presses and display the count. What do you need?',
      type: 'multipleChoice',
      choices: [
        'Just a button',
        'A button, a counter variable, and Serial output',
        'A button and an LED',
        'Only a counter variable',
      ],
      correctChoiceIndex: 1,
      tags: ['planning', 'state', 'components'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'What is the best way to detect when a button is PRESSED (not held)?',
      type: 'multipleChoice',
      choices: [
        'Check if digitalRead() == LOW',
        'Detect edge: currentState == LOW && previousState == HIGH',
        'Use analogRead() on the button',
        'Count delay() calls',
      ],
      correctChoiceIndex: 1,
      tags: ['edge-detection', 'button', 'state-tracking'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'You have 8 LEDs in an array and want to shift which one is lit. What do you need to track?',
      type: 'multipleChoice',
      choices: [
        'Eight bool variables, one per LED',
        'One int variable storing current position (0-7)',
        'An array of current states',
        'No tracking needed',
      ],
      correctChoiceIndex: 1,
      tags: ['arrays', 'led-shifter', 'state'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'In the LED shifter, why do we turn OFF the current LED before moving?',
      type: 'multipleChoice',
      choices: [
        'To save power',
        'So only one LED is on at a time',
        'LEDs must be turned off before moving',
        'To prevent damage',
      ],
      correctChoiceIndex: 1,
      tags: ['led-control', 'logic', 'sequence'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'You want to debug why your button code is not working. What is the best first step?',
      type: 'multipleChoice',
      choices: [
        'Rewrite all the code from scratch',
        'Use Serial.println() to print button state and see what values you\'re getting',
        'Buy a new button',
        'Change the pin number',
      ],
      correctChoiceIndex: 1,
      tags: ['debugging', 'serial', 'troubleshooting'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'To create a stopwatch that counts seconds, what approach makes sense?',
      type: 'multipleChoice',
      choices: [
        'Use delay(1000) and increment a counter',
        'Use millis() to track elapsed time non-blockingly',
        'Use analogRead for timing',
        'Count button presses',
      ],
      correctChoiceIndex: 1,
      tags: ['timing', 'millis', 'planning'],
    },
  },

  // ============ DECOMPOSITION - Difficulty 4 ============
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'To build a traffic light that auto-advances every 5 seconds WITHOUT blocking button input, you should use:',
      type: 'multipleChoice',
      choices: [
        'delay(5000)',
        'millis() to track time non-blockingly',
        'Multiple delay() calls',
        'analogRead() for timing',
      ],
      correctChoiceIndex: 1,
      tags: ['millis', 'non-blocking', 'advanced-timing'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'In the traffic light code, why is millis() used instead of delay() for the yellow light timing?',
      type: 'multipleChoice',
      choices: [
        'millis() is faster than delay()',
        'delay() would block button detection during the wait',
        'millis() is more accurate',
        'delay() only works with LEDs',
      ],
      correctChoiceIndex: 1,
      tags: ['millis', 'non-blocking', 'timing'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'To display a multi-LED pattern that cycles (LED1 on -> LED2 on -> LED3 on -> all off), what is the cleanest approach?',
      type: 'multipleChoice',
      choices: [
        'Use millis() and a state variable to track current pattern step',
        'Use many nested if statements with delay()',
        'Call digitalWrite() randomly',
        'Only use one LED',
      ],
      correctChoiceIndex: 0,
      tags: ['led-pattern', 'state-machine', 'millis'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'To create a system where pressing a button cycles through 3 LED colors, what state tracking is needed?',
      type: 'multipleChoice',
      choices: [
        'No state tracking needed',
        'One variable to store current color mode (0, 1, or 2)',
        'Three separate boolean variables',
        'Use delay() for tracking',
      ],
      correctChoiceIndex: 1,
      tags: ['state-machine', 'button', 'planning'],
    },
  },

  // ============ ADVANCED/STRETCH QUESTIONS (Difficulty 4 only) ============
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'To control a servo motor that sweeps back and forth (0° -> 180° -> 0°) continuously, what approach is best?',
      type: 'multipleChoice',
      choices: [
        'Use delay() and digitalWrite()',
        'Use a for loop to increment angle, then another to decrement, with servo.write()',
        'Just call servo.write(90) once',
        'Use analogRead() to control position',
      ],
      correctChoiceIndex: 1,
      tags: ['servo', 'sweep', 'loops', 'advanced'],
    },
  },
  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'You connect a servo motor. What library and function do you use to set its position to 90 degrees?',
      type: 'multipleChoice',
      choices: [
        'No library needed, use digitalWrite(pin, 90)',
        '#include <Servo.h> and servo.write(90)',
        'Use analogWrite(pin, 90)',
        'Use Serial.write(90)',
      ],
      correctChoiceIndex: 1,
      tags: ['servo', 'library', 'positioning', 'advanced'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'You want to build a nightlight that turns on when dark. Which sensor would you use?',
      type: 'multipleChoice',
      choices: [
        'Temperature sensor',
        'Light sensor (LDR)',
        'Ultrasonic sensor',
        'Push button',
      ],
      correctChoiceIndex: 1,
      tags: ['sensors', 'problem-solving', 'planning', 'advanced'],
    },
  },
  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt:
        'You want to read both a light sensor AND a temperature sensor to decide if a plant needs water (dark AND cold). How would you structure this?',
      type: 'multipleChoice',
      choices: [
        'Read both sensors, use if (light < threshold && temp < threshold)',
        'Only read the light sensor',
        'Read sensors in separate loop() calls',
        'Use analogWrite() to combine them',
      ],
      correctChoiceIndex: 0,
      tags: ['multi-sensor', 'logic', 'integration', 'advanced'],
    },
  },
  {
    dimension: 'low_level',
    difficulty: 4,
    questionType: 'multiple_choice',
    questionData: {
      prompt: 'Why does an int variable overflow at 32767 on Arduino?',
      type: 'multipleChoice',
      choices: [
        'That is a random limit',
        'int is 16-bit signed, range is -32768 to 32767',
        'Arduino only has 32KB memory',
        'It does not overflow, this is an error',
      ],
      correctChoiceIndex: 1,
      tags: ['data-types', 'overflow', 'limits', 'advanced'],
    },
  },

  // ============ CODE IDE QUESTIONS ============

  {
    dimension: 'hardware_io',
    difficulty: 2,
    questionType: 'code_ide',
    questionData: {
      prompt: 'Write Arduino code to blink an LED on pin 13 with a 500ms on/off interval.',
      type: 'codeIDE',
      starterCode: `void setup() {
  // Configure pin 13 here

}

void loop() {
  // Blink LED here

}`,
      testCases: [
        {
          id: '1',
          description: 'Pin 13 should be configured as OUTPUT',
          assertion: 'pinMode(13, OUTPUT) called in setup()',
        },
        {
          id: '2',
          description: 'LED should turn on and off',
          assertion: 'digitalWrite(13, HIGH) and digitalWrite(13, LOW) called',
        },
        {
          id: '3',
          description: '500ms delays used',
          assertion: 'delay(500) called after each digitalWrite',
        },
      ],
      tags: ['led', 'blink', 'basic'],
    },
  },

  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'code_ide',
    questionData: {
      prompt: 'Write code to read a button on pin 2 (with INPUT_PULLUP) and turn on an LED on pin 13 when the button is pressed.',
      type: 'codeIDE',
      starterCode: `void setup() {
  // Configure pins here

}

void loop() {
  // Read button and control LED

}`,
      testCases: [
        {
          id: '1',
          description: 'Pin 2 configured as INPUT_PULLUP',
          assertion: 'pinMode(2, INPUT_PULLUP) called',
        },
        {
          id: '2',
          description: 'Pin 13 configured as OUTPUT',
          assertion: 'pinMode(13, OUTPUT) called',
        },
        {
          id: '3',
          description: 'LED turns on when button reads LOW',
          assertion: 'if (digitalRead(2) == LOW) digitalWrite(13, HIGH)',
        },
      ],
      tags: ['button', 'led', 'input-pullup'],
    },
  },

  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'code_ide',
    questionData: {
      prompt: 'Write code to print numbers 1 through 10 to the Serial Monitor using a for loop.',
      type: 'codeIDE',
      starterCode: `void setup() {
  Serial.begin(9600);

  // Write your for loop here

}

void loop() {
  // No code needed in loop
}`,
      testCases: [
        {
          id: '1',
          description: 'For loop iterates from 1 to 10',
          assertion: 'for loop with i from 1 to 10',
        },
        {
          id: '2',
          description: 'Prints each number',
          assertion: 'Serial.println(i) inside loop',
        },
      ],
      tags: ['for-loop', 'serial', 'basic'],
    },
  },

  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'code_ide',
    questionData: {
      prompt: 'Write code to fade an LED on pin 9 from fully off to fully on over 2 seconds using analogWrite and a for loop.',
      type: 'codeIDE',
      starterCode: `void setup() {
  // Configure pin 9

}

void loop() {
  // Fade LED up

}`,
      testCases: [
        {
          id: '1',
          description: 'Pin 9 configured as OUTPUT',
          assertion: 'pinMode(9, OUTPUT)',
        },
        {
          id: '2',
          description: 'For loop incrementing brightness 0-255',
          assertion: 'for loop with brightness from 0 to 255',
        },
        {
          id: '3',
          description: 'analogWrite used to set brightness',
          assertion: 'analogWrite(9, brightness)',
        },
        {
          id: '4',
          description: 'Small delay between steps for smooth fade',
          assertion: 'delay() between analogWrite calls',
        },
      ],
      tags: ['pwm', 'analogWrite', 'fade', 'advanced'],
    },
  },

  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'code_ide',
    questionData: {
      prompt: 'Write code that uses millis() to blink an LED on pin 13 every 1000ms WITHOUT using delay(). Store the last time the LED changed in a variable.',
      type: 'codeIDE',
      starterCode: `unsigned long previousMillis = 0;
const long interval = 1000;
int ledState = LOW;

void setup() {
  // Configure pin

}

void loop() {
  // Non-blocking blink using millis()

}`,
      testCases: [
        {
          id: '1',
          description: 'Uses millis() to track time',
          assertion: 'millis() - previousMillis >= interval',
        },
        {
          id: '2',
          description: 'Updates previousMillis',
          assertion: 'previousMillis = millis() when LED changes',
        },
        {
          id: '3',
          description: 'Toggles LED state',
          assertion: 'ledState = !ledState or similar toggle logic',
        },
        {
          id: '4',
          description: 'No delay() used',
          assertion: 'No delay() calls in loop()',
        },
      ],
      tags: ['millis', 'non-blocking', 'advanced'],
    },
  },

  // ============ CHATBOT STUDENT QUESTIONS ============

  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: "A student is confused about binary representation. Help them understand what's wrong with their code.",
      type: 'chatbotStudent',
      chatbotPersona: "I'm trying to print binary numbers but I'm getting weird results. I thought 8 in binary was 111?",
      chatbotProblem: `void setup() {
  Serial.begin(9600);
  Serial.println(8, BIN);
  Serial.println("I expected 111");
}

void loop() {}`,
      chatbotSolution: "8 in binary is 1000, not 111. Binary 111 equals 7 (4+2+1). Binary 1000 equals 8 (8+0+0+0). Each position represents a power of 2: 8-4-2-1.",
      tags: ['binary', 'debugging', 'teaching'],
    },
  },

  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: "A student's if-statement isn't working as expected. Guide them to fix the logic error.",
      type: 'chatbotStudent',
      chatbotPersona: "My LED should turn on when the button is pressed, but it stays off all the time!",
      chatbotProblem: `const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  if (buttonState = HIGH) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}`,
      chatbotSolution: "Line 11 has an assignment (=) instead of comparison (==). Change 'if (buttonState = HIGH)' to 'if (buttonState == HIGH)'. The single = assigns HIGH to buttonState instead of checking if they're equal.",
      tags: ['operators', 'debugging', 'common-mistakes'],
    },
  },

  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: "A student's button isn't reading correctly. Help them understand pull-up resistors.",
      type: 'chatbotStudent',
      chatbotPersona: "My button gives random readings when I'm not pressing it. Sometimes 0, sometimes 1!",
      chatbotProblem: `const int BUTTON_PIN = 2;

void setup() {
  Serial.begin(9600);
  pinMode(BUTTON_PIN, INPUT);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  Serial.println(state);
  delay(100);
}`,
      chatbotSolution: "The pin is 'floating' when the button isn't pressed, causing random readings. Change 'pinMode(BUTTON_PIN, INPUT)' to 'pinMode(BUTTON_PIN, INPUT_PULLUP)'. This enables the internal pull-up resistor, making the pin read HIGH when not pressed and LOW when pressed.",
      tags: ['input', 'pullup', 'debugging'],
    },
  },

  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: "A student doesn't understand why their counter only prints once. Explain what's happening.",
      type: 'chatbotStudent',
      chatbotPersona: "I want to count from 1 to 10 repeatedly, but it only prints once then stops!",
      chatbotProblem: `void setup() {
  Serial.begin(9600);
  for (int i = 1; i <= 10; i++) {
    Serial.println(i);
  }
}

void loop() {
  // Empty
}`,
      chatbotSolution: "The for loop is in setup(), which only runs once when Arduino starts. Move the for loop into loop() to make it repeat. Setup runs once at power-on, loop runs continuously forever.",
      tags: ['setup-loop', 'program-structure', 'debugging'],
    },
  },

  {
    dimension: 'decomposition',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: "A student's traffic light blinks too fast. Help them fix the timing issue.",
      type: 'chatbotStudent',
      chatbotPersona: "My traffic light blinks so fast I can't see the colors! I want red for 2 seconds, then green for 3 seconds.",
      chatbotProblem: `const int RED = 7;
const int GREEN = 5;

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
}

void loop() {
  digitalWrite(RED, HIGH);
  delay(2);
  digitalWrite(RED, LOW);

  digitalWrite(GREEN, HIGH);
  delay(3);
  digitalWrite(GREEN, LOW);
}`,
      chatbotSolution: "The delays are in milliseconds, not seconds. Change 'delay(2)' to 'delay(2000)' and 'delay(3)' to 'delay(3000)'. delay(2) waits only 2 milliseconds (0.002 seconds), making it blink too fast to see.",
      tags: ['delay', 'timing', 'units'],
    },
  },

  {
    dimension: 'low_level',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student is confused about analog vs digital signals.',
      type: 'chatbotStudent',
      chatbotPersona: 'I do not understand the difference between digitalWrite and analogWrite. When do I use each?',
      chatbotProblem: `// Student wants to control LED brightness
void loop() {
  digitalWrite(9, 128); // Trying to set 50% brightness
  delay(1000);
}`,
      chatbotSolution: "digitalWrite only sets pins to HIGH (on) or LOW (off) - it is digital (only 2 states). For LED brightness control, use analogWrite(pin, value) where value is 0-255. analogWrite(9, 128) would give 50% brightness. digitalWrite(9, HIGH) would be full on, digitalWrite(9, LOW) would be off. Use analogWrite for PWM pins (marked with ~) when you need variable output levels.",
      tags: ['analog', 'digital', 'pwm'],
    },
  },

  {
    dimension: 'control_flow',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student has an infinite loop bug. Help them fix it.',
      type: 'chatbotStudent',
      chatbotPersona: 'My for loop never stops! It just keeps printing numbers forever!',
      chatbotProblem: `void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 10; i--) {
    Serial.println(i);
  }
}
void loop() {}`,
      chatbotSolution: "Line 3: You are using i-- (decrement) instead of i++ (increment). Since i starts at 0 and you keep subtracting 1 (going negative), i will NEVER reach 10, so the condition 'i < 10' is always true. Change i-- to i++ to increment the counter upward.",
      tags: ['for-loop', 'infinite-loop', 'operators'],
    },
  },

  {
    dimension: 'hardware_io',
    difficulty: 4,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student has a potentiometer mapping issue. Help them understand map().',
      type: 'chatbotStudent',
      chatbotPersona: 'I want to control LED brightness with a potentiometer, but my map() function is not working right!',
      chatbotProblem: `void loop() {
  int sensorValue = analogRead(A0);  // 0-1023
  int brightness = map(sensorValue, 0, 255, 0, 1023);
  analogWrite(9, brightness);
}`,
      chatbotSolution: "The map() parameters are backwards. map(value, fromLow, fromHigh, toLow, toHigh). Your sensor reads 0-1023, and you want to map it to LED brightness 0-255. Correct code: 'int brightness = map(sensorValue, 0, 1023, 0, 255);'. You had the ranges swapped.",
      tags: ['map', 'analog', 'potentiometer'],
    },
  },

  {
    dimension: 'decomposition',
    difficulty: 4,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student is trying to implement edge detection but it triggers constantly.',
      type: 'chatbotStudent',
      chatbotPersona: 'I want my LED to toggle when the button is pressed, but it toggles super fast even when I just hold the button!',
      chatbotProblem: `int buttonPin = 2;
int ledPin = 13;
int ledState = LOW;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  if (digitalRead(buttonPin) == LOW) {
    ledState = !ledState;
    digitalWrite(ledPin, ledState);
  }
}`,
      chatbotSolution: "You are checking the button state every loop iteration (thousands of times per second). When you hold the button, it toggles continuously. You need edge detection: track previousState and only toggle when the button CHANGES from HIGH to LOW. Add: 'int previousState = HIGH;' before loop. Then: 'int currentState = digitalRead(buttonPin); if (currentState == LOW && previousState == HIGH) { ledState = !ledState; ... } previousState = currentState;'",
      tags: ['edge-detection', 'debouncing', 'state-tracking'],
    },
  },

  {
    dimension: 'hardware_io',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student has a Serial Monitor that shows nothing. Help them troubleshoot.',
      type: 'chatbotStudent',
      chatbotPersona: 'I uploaded my code successfully but the Serial Monitor is blank!',
      chatbotProblem: `void setup() {
  Serial.begin(9600);
  Serial.println("Hello!");
}

void loop() {
  Serial.println("Running...");
  delay(1000);
}`,
      chatbotSolution: "Check: (1) Is Serial Monitor open? (Tools > Serial Monitor or Ctrl+Shift+M). (2) Is the baud rate in Serial Monitor set to 9600 to match Serial.begin(9600)? (3) Did you select the correct COM port? (4) Try closing and reopening Serial Monitor. (5) Press the reset button on Arduino while Serial Monitor is open. The code is correct.",
      tags: ['serial', 'debugging', 'ide'],
    },
  },

  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student cannot upload their code. Guide them through troubleshooting.',
      type: 'chatbotStudent',
      chatbotPersona: 'When I click Upload, it just says "Uploading..." forever then times out!',
      chatbotProblem: `// Code compiles fine but won't upload
void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
      chatbotSolution: "Check: (1) Is the correct board selected in Tools > Board? (2) Is the correct COM port selected in Tools > Port? (3) Is the USB cable properly connected? (4) Try pressing the reset button on the Arduino before uploading. (5) Close any other programs using the serial port (like Serial Monitor). The code itself is fine - this is a communication issue.",
      tags: ['upload-error', 'troubleshooting', 'ide'],
    },
  },

  {
    dimension: 'code_reading',
    difficulty: 3,
    questionType: 'trace' as any,
    questionData: {
      prompt: 'A student gets a compile error. Help them identify the problem.',
      type: 'chatbotStudent',
      chatbotPersona: 'I get an error that says "expected unqualified-id before opening brace token" on line 3!',
      chatbotProblem: `void setup() {
  pinMode(13, OUTPUT)
}

void loop() {
  digitalWrite(13, HIGH);
}`,
      chatbotSolution: "Line 2 is missing a semicolon after OUTPUT. Every statement in C/Arduino must end with a semicolon. The compiler gets confused when it sees the closing brace without the semicolon.",
      tags: ['compile-error', 'semicolon', 'syntax'],
    },
  },
];

async function seedQuestionBank() {
  console.log('🌱 Seeding cleaned question bank aligned with eBricks-AI Ch 0-6...\n');

  let inserted = 0;
  let skipped = 0;

  for (const q of seedQuestions) {
    try {
      // Check if EXACT same question exists (by prompt)
      const existing = await db
        .select()
        .from(questionBank)
        .where(
          and(
            eq(questionBank.dimension, q.dimension as any),
            eq(questionBank.difficulty, q.difficulty),
          ),
        );

      // Check if any existing question has the same prompt
      const duplicate = existing.find(
        (row) => row.questionData.prompt === q.questionData.prompt
      );

      if (duplicate) {
        skipped++;
        continue;
      }

      // Insert the question
      await db.insert(questionBank).values({
        dimension: q.dimension as any,
        difficulty: q.difficulty,
        questionType: q.questionType,
        questionData: q.questionData,
        answerData: {}, // Empty for now, not used in evaluation
        usageCount: 0,
      });

      inserted++;
      console.log(
        `✓ Added: ${q.dimension} - Difficulty ${q.difficulty} (${q.questionType})`,
      );
    } catch (error) {
      console.error(`✗ Failed to insert question:`, error);
    }
  }

  console.log(
    `\n✅ Seeding complete! Inserted ${inserted} questions, skipped ${skipped} duplicates.\n`,
  );
}

// Run the seed function
seedQuestionBank()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding questions:', error);
    process.exit(1);
  });
