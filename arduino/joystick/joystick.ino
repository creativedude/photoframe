#include <Keyboard.h>

#define joyX A1
#define joyY A0
const int buttonPin = 10;  // the number of the pushbutton pin
#define THRESHOLD 921      // 90% of 1023 for upper threshold
#define DEBOUNCE_DELAY 300 // debounce time in milliseconds

int xValue, yValue;
unsigned long lastDebounceTime = 0;

// variables will change:
int buttonState = 0;

void setup()
{
  Keyboard.begin();
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop()
{
  unsigned long currentTime = millis();

  // Button handling

  buttonState = digitalRead(buttonPin);

  // Read joystick values
  xValue = analogRead(joyX);
  yValue = analogRead(joyY);

  // Only process joystick input if enough time has passed since last change

  if (currentTime - lastDebounceTime > DEBOUNCE_DELAY)
  {

    if (buttonState == LOW)
    {
      Serial.println("Enter");

      // KEY_RETURN

      Serial.println("enter");
      lastDebounceTime = currentTime;
      Keyboard.press(KEY_RETURN);
      delay(100);
      Keyboard.releaseAll();
    }

    // Check if joystick is in upper threshold range
    if (xValue > THRESHOLD)
    {
      Serial.println("Right");
      lastDebounceTime = currentTime;
      Keyboard.press(KEY_RIGHT_ARROW);
      delay(100);
      Keyboard.releaseAll();
    }
    else if (xValue < (1023 - THRESHOLD))
    {
      Serial.println("Left");

      lastDebounceTime = currentTime;
      Keyboard.press(KEY_LEFT_ARROW);
      delay(100);
      Keyboard.releaseAll();
    }
    else if (yValue > THRESHOLD)
    {
      Serial.println("Down");
      lastDebounceTime = currentTime;
      Keyboard.press(KEY_DOWN_ARROW);
      delay(100);
      Keyboard.releaseAll();
    }
    else if (yValue < (1023 - THRESHOLD))
    {
      Serial.println("Up");
      lastDebounceTime = currentTime;
      Keyboard.press(KEY_UP_ARROW);
      delay(100);
      Keyboard.releaseAll();
    }
  }
}
