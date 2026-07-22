INSERT INTO lessons
(
    module_id,
    lesson_order,
    lesson_title,
    difficulty,
    estimated_duration,
    content
)
VALUES

(1,1,'Introduction to C','Beginner','30 min',
'History, features and applications of C Programming.'),

(1,2,'Variables and Data Types','Beginner','45 min',
'Integer, float, char, double and variable declaration.'),

(1,3,'Operators','Beginner','40 min',
'Arithmetic, relational, logical and bitwise operators.'),

(1,4,'Conditional Statements','Beginner','45 min',
'if, if-else and switch statements.'),

(1,5,'Loops','Beginner','50 min',
'for, while and do-while loops with examples.'),

(1,6,'Functions','Intermediate','60 min',
'Function declaration, definition and recursion.'),

(1,7,'Arrays','Intermediate','60 min',
'Single-dimensional and multidimensional arrays.'),

(1,8,'Pointers','Intermediate','75 min',
'Pointer basics, pointer arithmetic and memory access.'),

(1,9,'Structures','Intermediate','60 min',
'Structures, typedef and nested structures.'),

(1,10,'File Handling','Advanced','60 min',
'Reading and writing files using fopen, fclose, fread and fwrite.')

ON CONFLICT (module_id, lesson_order)
DO NOTHING;
INSERT INTO lessons
(
    module_id,
    lesson_order,
    lesson_title,
    difficulty,
    estimated_duration,
    content
)
VALUES

(2,1,'Embedded Systems Overview','Beginner','30 min',
'Introduction to embedded systems, applications and architecture.'),

(2,2,'Embedded C Basics','Beginner','45 min',
'Embedded C programming concepts and differences from standard C.'),

(2,3,'Memory Mapping','Intermediate','45 min',
'Memory map, ROM, RAM, Flash and peripheral registers.'),

(2,4,'Bit Manipulation','Intermediate','45 min',
'Bit masking, shifting and register level programming.'),

(2,5,'Interrupt Basics','Intermediate','50 min',
'Interrupts, ISR and interrupt priority.'),

(2,6,'Timers','Intermediate','60 min',
'Hardware timers, counters and delay generation.'),

(2,7,'Watchdog Timer','Intermediate','45 min',
'Watchdog timer operation and system recovery.'),

(2,8,'Low Power Modes','Advanced','60 min',
'Sleep modes, standby mode and power optimization.')

ON CONFLICT (module_id, lesson_order)
DO NOTHING;
-- ==========================================
-- Module 3 : Microcontrollers
-- ==========================================

INSERT INTO lessons
(
    module_id,
    lesson_order,
    lesson_title,
    difficulty,
    estimated_duration,
    content
)
VALUES

(3,1,'8051 Architecture','Beginner','45 min',
'Introduction to the 8051 microcontroller, CPU architecture and pin configuration.'),

(3,2,'ARM Cortex-M Overview','Beginner','45 min',
'Overview of ARM Cortex-M processors and STM32 family.'),

(3,3,'STM32 Basics','Intermediate','60 min',
'STM32 development boards, IDE setup and first program.'),

(3,4,'Clock System','Intermediate','45 min',
'Internal clock, external crystal and PLL configuration.'),

(3,5,'Memory Organization','Intermediate','45 min',
'Flash memory, SRAM, EEPROM concepts and memory map.'),

(3,6,'GPIO Basics','Beginner','45 min',
'GPIO ports, registers and digital input/output.'),

(3,7,'GPIO Input','Intermediate','45 min',
'Reading push buttons, switches and digital inputs.'),

(3,8,'GPIO Output','Intermediate','45 min',
'Controlling LEDs, relays and digital outputs.'),

(3,9,'Interrupt Controller (NVIC)','Advanced','60 min',
'Nested Vector Interrupt Controller configuration and interrupt handling.'),

(3,10,'Embedded Development Tools','Intermediate','60 min',
'STM32CubeIDE, Keil uVision, debugging and flashing firmware.')

ON CONFLICT (module_id, lesson_order)
DO NOTHING;
-- ==========================================
-- Module 4 : GPIO
-- ==========================================

INSERT INTO lessons
(
    module_id,
    lesson_order,
    lesson_title,
    difficulty,
    estimated_duration,
    content
)
VALUES

(4,1,'Introduction to GPIO','Beginner','30 min',
'Understanding General Purpose Input Output pins and their applications.'),

(4,2,'GPIO Registers','Beginner','45 min',
'GPIO control registers, direction registers and data registers.'),

(4,3,'GPIO Input Configuration','Intermediate','45 min',
'Configuring GPIO pins as digital inputs with pull-up and pull-down resistors.'),

(4,4,'GPIO Output Configuration','Intermediate','45 min',
'Configuring GPIO pins as digital outputs and driving LEDs.'),

(4,5,'Push Button Interface','Intermediate','45 min',
'Interfacing push buttons using GPIO and software debouncing.'),

(4,6,'LED Blinking Project','Beginner','40 min',
'Creating a basic LED blinking application using GPIO.'),

(4,7,'GPIO Interrupts','Advanced','60 min',
'Using external interrupts with GPIO pins.'),

(4,8,'GPIO Best Practices','Intermediate','40 min',
'GPIO protection, power considerations and common mistakes.')

ON CONFLICT (module_id, lesson_order)
DO NOTHING;