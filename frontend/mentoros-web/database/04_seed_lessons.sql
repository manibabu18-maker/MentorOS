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