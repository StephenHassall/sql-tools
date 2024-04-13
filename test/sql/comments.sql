SELECT
# This is a line comment
*
-- This is a line comment
FROM
/*
  This is a comment over many lines
*/
table
WHERE
  field1=/*inline comment*/12 AND
  field2="/*this is not a comment*/" AND
  field3="--this is not a comment" AND
  field4="#this is not a comment" AND
  field5='/*this is not a comment*/' AND
  field6='--this is not a comment' AND
  field7='#this is not a comment'
ORDER BY -- End of line comment
  field8, # End of line comment
  field9; /* End of line comment */
