ALTER DATABASE SportsLeague SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
DROP DATABASE SportsLeague;
GO

CREATE DATABASE SportsLeague
GO

USE SportsLeague
GO

CREATE TABLE Teams (
    TeamID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Coach VARCHAR(255) NOT NULL,);
GO
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    Username VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(10) NOT NULL CHECK (Role IN ('Admin', 'Owner')), --e ENUM('Admin', 'Owner', 'Fan') NOT NULL,
    TeamID INT,
    FOREIGN KEY (TeamID) REFERENCES Teams(TeamID) ON DELETE CASCADE on UPDATE CASCADE
);
GO

CREATE TABLE Players (
    PlayerID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Age INT NOT NULL,
    Position VARCHAR(100) NOT NULL,
    TeamID INT NOT NULL,
    FOREIGN KEY (TeamID) REFERENCES Teams(TeamID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO

CREATE TABLE Matches (
    MatchID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    Date DATE NOT NULL,
    Venue VARCHAR(255) NOT NULL,
    Team1ID INT NOT NULL,
    Team2ID INT NOT NULL,
    Result VARCHAR(255) NOT NULL,
    FOREIGN KEY (Team1ID) REFERENCES Teams(TeamID) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (Team2ID) REFERENCES Teams(TeamID) ON DELETE NO ACTION ON UPDATE NO ACTION
);
Go
CREATE TABLE PlayerStats (
    PlayerID INT,
    Runs INT NOT NULL,
    Wickets INT NOT NULL,
    TotalInnings INT NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID) ON DELETE CASCADE ON UPDATE CASCADE
);
GO

CREATE TABLE PlayerTransactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    PlayerID INT ,
    FromTeamID INT ,
    ToTeamID INT ,
    Type VARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    LoanStartDate DATE,
    LoanEndDate DATE,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES Players(PlayerID) ON DELETE SET NULL ON UPDATE NO ACTION,
    FOREIGN KEY (FromTeamID) REFERENCES Teams(TeamID) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (ToTeamID) REFERENCES Teams(TeamID) ON DELETE NO ACTION ON UPDATE NO ACTION
);
GO


// Get player by ID with stats - in controllers/playerController.js


// In routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const authMiddleware = require('../middleware/authMiddleware');

// Get player by ID route
router.get('/:id', authMiddleware.verifyToken, playerController.getPlayerById);

// Other player routes...
// router.post('/', authMiddleware.verifyToken, playerController.createPlayer);
// router.put('/:id', authMiddleware.verifyToken, playerController.updatePlayer);
// router.delete('/:id', authMiddleware.verifyToken, playerController.deletePlayer);

module.exports = router;

-- =============================================
-- 1. Insert Teams (PSL Season 8 Teams)
-- =============================================
INSERT INTO Teams (Name, Coach, Owner) VALUES
('Islamabad United', 'Azhar Mahmood', 2),
('Karachi Kings', 'Javed Miandad', 3),
('Lahore Qalandars', 'Aaqib Javed', 4),
('Multan Sultans', 'Andy Flower', 5),
('Peshawar Zalmi', 'Daren Sammy', 6),
('Quetta Gladiators', 'Sarfraz Ahmed', 7);
GO
-- =============================================
-- 2. Insert Users (Admin, Team Owners, Fans)
-- =============================================
INSERT INTO Users (Username, Password, Role, TeamID) VALUES
( 'PCB', 'adminpass', 'Admin', NULL),
('Leonine Global Investments', 'passIU', 'Owner', 1),
('Salman Iqbal', 'passKK', 'Owner', 2),
('Fawad Rana', 'passLQ', 'Owner', 3),
('Ali Tareen', 'passMS', 'Owner', 4),
('Javaid Afridi', 'passPZ', 'Owner', 5),
('Nadeem Omer', 'passQG', 'Owner', 6);
GO

-- =============================================
-- 3. Insert Players
--    (10 players per team for demonstration)
-- =============================================

-- Islamabad United (TeamID = 1)
INSERT INTO Players ( Name, Age, Position, TeamID) VALUES
('Shadab Khan',           27, 'All-Rounder',           1),
('Iftikhar Ahmed',         29, 'Batsman/Wicketkeeper',  1),
('Asif Ali',               28, 'Batsman',               1),
('Rumman Raees',           30, 'Batsman',               1),
('Mohammad Haris',         25, 'Bowler',                1),
('Shoaib Akhtar Jr',       26, 'Bowler',                1),
('Fawad Alam',             33, 'Batsman',               1),
('Zahid Mehmood',          24, 'Bowler',                1),
('Sarfraz Khan',           27, 'All-Rounder',           1),
('Taimur Ali',             23, 'Batsman',               1);
GO
-- Karachi Kings (TeamID = 2)
INSERT INTO Players (Name, Age, Position, TeamID) VALUES
('Babar Azam',             32, 'Batsman',               2),
('Mohammad Amir',          30, 'Bowler',                2),
('Fakhar Zaman',           28, 'Batsman',               2),
('Imad Wasim',             30, 'All-Rounder',           2),
('Sohail Khan',            27, 'Bowler',                2),
('Shahzaib Hasan',         28, 'Batsman',               2),
('Arshad Iqbal',           29, 'Batsman',               2),
('Adnan Malik',            31, 'Bowler',                2),
('Waqar Ahmed',            27, 'Bowler',                2);
GO
-- Lahore Qalandars (TeamID = 3)
INSERT INTO Players (Name, Age, Position, TeamID) VALUES
('Shaheen Afridi',         26, 'Bowler',                3),
('Haris Rauf',             27, 'Bowler',                3),
('Rashid Khan',            30, 'All-Rounder',           3),
('Quinton de Kock',        33, 'Wicketkeeper',          3),
('Ahsan Ali',              28, 'Batsman',               3),
('Saim Ayub',              27, 'All-Rounder',           3),
('Rameez Raja',            32, 'Batsman',               3),
('Tariq Hussain',          25, 'Bowler',                3),
('Imran Khalid',           26, 'Bowler',                3),
('Nadeem Shah',            29, 'Batsman',               3);
GO
-- Multan Sultans (TeamID = 4)
INSERT INTO Players (Name, Age, Position, TeamID) VALUES
('Mohammad Rizwan',        29, 'Wicketkeeper',          4),
('Shoaib Malik',           38, 'All-Rounder',           4),
('Imran Tahir',            44, 'Bowler',                4),
('Kieron Pollard',         34, 'All-Rounder',           4),
('Alex Hales',             33, 'Batsman',               4),
('Haris Sohail',           27, 'Batsman',               4),
('Naveed Akhtar',          28, 'Bowler',                4),
('Arslan Khan',            24, 'Batsman',               4),
('Saifullah Khan',         26, 'Bowler',                4),
('Kamran Latif',           30, 'All-Rounder',           4);
GO
-- Peshawar Zalmi (TeamID = 5)
INSERT INTO Players (Name, Age, Position, TeamID) VALUES
('Tim David',              28, 'All-Rounder',           5),
('Wahab Riaz',             33, 'Bowler',                5),
('Qasim Akram',            27, 'Bowler',                5),
('Haider Ali',             24, 'Batsman',               5),
('Saim Raza',              26, 'All-Rounder',           5),
('Aamer Yamin',            29, 'Batsman',               5),
('Asif Shahzad',           28, 'Batsman',               5),
('Kamran Malik',           27, 'Bowler',                5),
('Rizwan Ahmed',           26, 'Batsman',               5),
('Usman Qadir',            28, 'Bowler',                5);
GO
-- Quetta Gladiators (TeamID = 6)
INSERT INTO Players (Name, Age, Position, TeamID) VALUES
('Hasan Ali',              28, 'Bowler',                6),
('Muhammad Nawaz',         27, 'Bowler',                6),
('Fahad Iqbal',            29, 'Batsman',               6),
('Rizwan Yousuf',          30, 'Batsman',               6),
('Sajid Khan',             26, 'Bowler',                6),
('Noman Ali',              28, 'All-Rounder',           6),
('Ali Akbar',              27, 'Bowler',                6),
('Arif Ali',               29, 'Batsman',               6),
('Azeem Qureshi',          31, 'Batsman',               6),
('Imran Butt',             32, 'Bowler',                6);
GO
-- =============================================
-- 4. Insert Matches (Sample Round-Robin & Playoffs)
-- =============================================
INSERT INTO Matches (Date, Venue, Team1ID, Team2ID, Result) VALUES
('2023-02-09', 'Rawalpindi Cricket Stadium',          1, 2, 'Islamabad United won by 10 runs'),
('2023-02-10', 'Gaddafi Stadium, Lahore',                 3, 4, 'Lahore Qalandars won by 8 wickets'),
('2023-02-11', 'Arbab Niaz Stadium, Peshawar',              5, 6, 'Peshawar Zalmi won by 12 runs'),
('2023-02-12', 'National Stadium, Karachi',               2, 3, 'Karachi Kings won by 5 wickets'),
('2023-02-13', 'Multan Cricket Stadium',                    1, 4, 'Multan Sultans won by 3 wickets'),
('2023-02-14', 'National Stadium, Karachi',               5, 2, 'Karachi Kings won by 2 wickets'),
('2023-02-15', 'Rawalpindi Cricket Stadium',              6, 1, 'Islamabad United won by 15 runs'),
('2023-02-16', 'Gaddafi Stadium, Lahore',                 3, 5, 'Lahore Qalandars won by 6 wickets'),
('2023-02-17', 'Multan Cricket Stadium',                    4, 6, 'Quetta Gladiators won by 4 runs'),
('2023-02-18', 'National Stadium, Karachi',               2, 1, 'Karachi Kings won by 7 wickets');
GO
-- =============================================
-- 5. Insert PlayerStats (Performance Data for Sample Matches)
-- =============================================
INSERT INTO PlayerStats (PlayerID, Runs, Wickets, TotalInnings) VALUES
(1,  45, 1, 1),   -- Shadab Khan, Islamabad United
(11, 55, 0, 1),   -- Babar Azam, Karachi Kings
(21, 30, 2, 1),   -- Shaheen Afridi, Lahore Qalandars
(31, 40, 0, 1),   -- Mohammad Rizwan, Multan Sultans
(41, 50, 1, 1),   -- Tim David, Peshawar Zalmi
(51, 20, 3, 1),   -- Hasan Ali, Quetta Gladiators
(2,  35, 0, 1),   -- Iftikhar Ahmed, Islamabad United
(12, 60, 0, 1),   -- Mohammad Amir, Karachi Kings
(22, 25, 2, 1),   -- Haris Rauf, Lahore Qalandars
(32, 45, 0, 1),   -- Shoaib Malik, Multan Sultans
(42 , 40, 1, 1),   -- Wahab Riaz, Peshawar Zalmi
(52, 15, 2, 1),   -- Muhammad Nawaz, Quetta Gladiators
(3,  50, 0, 1),   -- Asif Ali, Islamabad United
(14, 70, 0, 1),   -- Imad Wasim, Karachi Kings
(23, 30, 2, 1);   -- Rashid Khan, Lahore Qalandars
GO
-- =============================================
-- 6. Insert PlayerTransactions (Player Movements)
-- =============================================
INSERT INTO PlayerTransactions (PlayerID, FromTeamID, ToTeamID, Type, Amount, LoanStartDate, LoanEndDate, Status) VALUES
( 13, 2, 4, 'Loan', 120000.00, '2023-02-05', '2023-03-05', 'Approved'),
(22, 3, 5, 'Sell', 180000.00, NULL, NULL, 'Completed'),
(35, 4, 2, 'Loan', 90000.00, '2023-02-15', '2023-03-15', 'Pending');
GO
-- ==========================================
-- VIEW QUERIES
-- ==========================================

SELECT * FROM Matches
SELECT * FROM Players
SELECT * FROM PlayerStats
SELECT * FROM PlayerTransactions
SELECT * FROM Teams
SELECT * FROM Users

-- ==========================================
-- UPDATE QUERIES
-- ==========================================

-- 10. Update team details
UPDATE Teams
SET Coach = 'Faiq Saeed', Name = 'Islamabad United'
WHERE TeamID = 1;

-- 11. Update player information
UPDATE Players
SET Age = 36, Position = 'Opening Batsman'
WHERE PlayerID = 1;

-- 12. Update match result after completion
UPDATE Matches
SET Result = 'Team 1 won by 8 wickets'
WHERE MatchID = 1;

-- 13. Update player stats after a match
UPDATE PlayerStats
SET Runs = Runs + 44, Wickets = Wickets + 2, TotalInnings = TotalInnings + 1
WHERE PlayerID = 1;

-- 14. Approve a loan request
UPDATE PlayerTransactions
SET Status = 'Approved'
WHERE TransactionID = 3 AND Type = 'Loan' AND Status = 'Pending';

-- 15. Update user password
UPDATE Users
SET Password = 'new_hashed_password'
WHERE UserID = 102;

-- ==========================================
-- DELETE QUERIES
-- ==========================================

-- 16. Delete a player from the system
DELETE FROM Players
WHERE PlayerID = 5;

-- 17. Cancel a scheduled match
DELETE FROM Matches
WHERE MatchID = 3 AND Result = 'Pending';

-- 18. Remove a user from the system
DELETE FROM Users
WHERE UserID = 104;

-- 19. Cancel a pending transaction
DELETE FROM PlayerTransactions
WHERE TransactionID = 3 AND Status = 'Pending';

-- ==========================================
-- SELECT QUERIES
-- ==========================================

-- 20. Find all players of a specific team 
SELECT Name, Age, Position
FROM Players
WHERE TeamID = 1;

-- 21. Search for players by name pattern (LIKE)
SELECT  Name, Age, Position, TeamID
FROM Players
WHERE Name LIKE '%Ba%';

-- 22. List matches scheduled at a specific venue (WHERE)
SELECT MatchID, Date, Team1ID, Team2ID
FROM Matches
WHERE Venue = 'National Stadium, Karachi';

-- 23. Get teams with their total player count (GROUP BY + COUNT)
SELECT  t.Name, COUNT(p.PlayerID) AS PlayerCount
FROM Teams t LEFT JOIN Players p ON t.TeamID = p.TeamID
GROUP BY t.TeamID, t.Name;

-- 24. Find teams with more than x amount of players (HAVING)
SELECT TeamID, COUNT(PlayerID) AS PlayerCount
FROM Players
GROUP BY TeamID
HAVING COUNT(PlayerID) > 9;

-- 25. Get top 5 run scorers 
SELECT TOP 5  p.Name, SUM(ps.Runs) AS TotalRuns
FROM Players p JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
GROUP BY p.PlayerID, p.Name
ORDER BY TotalRuns DESC;

-- 26. Calculate average runs per team (AVG)
SELECT t.Name AS TeamName, AVG(ps.Runs) AS AvgRuns
FROM Players p JOIN Teams t ON p.TeamID = t.TeamID JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
GROUP BY p.TeamID, t.Name;

-- 27. Find the player with the highest wickets (MAX)
SELECT TOP 1  p.Name, p.TeamID, MAX(ps.Wickets) AS MaxWickets
FROM Players p JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
GROUP BY p.Name, p.TeamID
ORDER BY MaxWickets DESC;


-- 28. Calculate total runs scored by each team (SUM)
SELECT p.TeamID, t.Name AS TeamName, SUM(ps.Runs) AS TotalTeamRuns
FROM Players p JOIN Teams t ON p.TeamID = t.TeamID JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
GROUP BY p.TeamID, t.Name;


-- 29. List matches in descending order by match date
SELECT * FROM Matches
ORDER BY Date DESC;

-- 30. Calculate the batting average for each player 
select name,runs/totalinnings as average
from playerstats p1 join players p2 on
p1.playerid=p2.playerid

-- ==========================================
-- JOIN QUERIES
-- ==========================================

-- 30. Get all players with their team information 
SELECT p.Name, p.Position, t.Name AS TeamName
FROM Players p JOIN Teams t ON p.TeamID = t.TeamID;

-- 31. Get all teams with their owner information 
SELECT t.TeamID, t.Name AS TeamName, u.Username AS OwnerName
FROM Teams t JOIN Users u ON t.Owner = u.UserID;

-- 32. List all matches with team names 
SELECT m.Date, m.Venue, t1.Name AS Team1Name, t2.Name AS Team2Name, m.Result
FROM Matches m JOIN Teams t1 ON m.Team1ID = t1.TeamID JOIN Teams t2 ON m.Team2ID = t2.TeamID;

-- 33. Get all users with their team information 
SELECT u.UserID, u.Username, u.Role, t.Name AS TeamName FROM Users u
LEFT JOIN Teams t ON u.TeamID = t.TeamID;

-- 34. List teams with their total loan transactions 
SELECT t.TeamID, t.Name, COUNT(pt.TransactionID) AS LoanCount
FROM PlayerTransactions pt RIGHT JOIN Teams t ON pt.FromTeamID = t.TeamID AND pt.Type = 'Loan'
GROUP BY t.TeamID, t.Name;

-- 35. Find players who haven't played any matches 
SELECT p.PlayerID, p.Name, p.Age, p.Position, p.TeamID
FROM Players p LEFT JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
WHERE ps.PlayerID IS NULL;


-- 36. List all possible team matchups (CROSS JOIN / FULL OUTER JOIN)
SELECT  t1.Name AS Team1Name, t2.Name AS Team2Name
FROM Teams t1 FULL OUTER JOIN Teams t2 ON t1.TeamID <> t2.TeamID
WHERE t1.TeamID <> t2.TeamID;


-- ==========================================
-- SET OPERATIONS
-- ==========================================

-- 37. Combining players of two teams
SELECT PlayerID, Name FROM Players WHERE TeamID = 1
UNION
SELECT PlayerID, Name FROM Players WHERE TeamID = 2;

-- 38. Find players who are both captains are Under 30(INTERSECT)
SELECT PlayerID, Name FROM Players WHERE Age < 30
INTERSECT
SELECT PlayerID, Name FROM Players WHERE Position = 'Captain'

-- 39. Find Captains who are not WK (EXCEPT)
SELECT PlayerID, Name, TeamID FROM Players WHERE Position = 'Captain'
EXCEPT
SELECT PlayerID, Name, TeamID FROM Players WHERE Position = 'Wicketkeeper';

-- ==========================================
-- SUBQUERIES / NESTED QUERIES
-- ==========================================

-- 40. Find players who have scored more runs than the average (Subquery in WHERE)
SELECT p.Name, ps.Runs
FROM Players p
JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
WHERE ps.Runs > (SELECT AVG(Runs) FROM PlayerStats);

-- 41. List teams with their highest run scorer (Subquery in JOIN)
SELECT t.Name AS TeamName, p.Name AS PlayerName, ps.Runs
FROM Teams t 
JOIN Players p ON t.TeamID = p.TeamID 
JOIN PlayerStats ps ON p.PlayerID = ps.PlayerID
WHERE ps.Runs = (
    SELECT MAX(ps2.Runs)
    FROM Players p2
    JOIN PlayerStats ps2 ON p2.PlayerID = ps2.PlayerID
    WHERE p2.TeamID = t.TeamID
);



-- 43. Get player transfer details with derived transaction value (Nested subquery)
SELECT p.Name AS PlayerName, t1.Name AS FromTeam, t2.Name AS ToTeam, pt.Amount, (SELECT AVG(Amount) FROM PlayerTransactions WHERE Type = pt.Type) AS AvgTransactionAmount
FROM PlayerTransactions pt JOIN Players p ON pt.PlayerID = p.PlayerID
JOIN Teams t1 ON pt.FromTeamID = t1.TeamID JOIN Teams t2 ON pt.ToTeamID = t2.TeamID;

-- 44. League standings based on match results (Complex query with multiple joins and calculations)
-- League standings based on match results

SELECT 
    t.Name AS TeamName, COUNT(m.MatchID) AS TotalMatches,
    SUM(CASE 
        WHEN (m.Team1ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%') OR 
             (m.Team2ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%')
        THEN 1 ELSE 0 
    END) AS Wins,

    SUM(CASE 
        WHEN m.Result LIKE '%draw%' OR m.Result LIKE '%tie%' 
        THEN 1 ELSE 0 
    END) AS Draws,

    SUM(CASE 
        WHEN (m.Team1ID = t.TeamID OR m.Team2ID = t.TeamID) AND 
             m.Result NOT LIKE '%' + t.Name + ' won%' AND
             m.Result NOT LIKE '%draw%' AND 
             m.Result NOT LIKE '%tie%'
        THEN 1 ELSE 0 
    END) AS Losses,

    (SUM(CASE 
        WHEN (m.Team1ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%') OR 
             (m.Team2ID = t.TeamID AND m.Result LIKE '%' + t.Name + ' won%')
        THEN 1 ELSE 0 
    END) * 2 + 
    SUM(CASE 
        WHEN m.Result LIKE '%draw%' OR m.Result LIKE '%tie%' 
        THEN 1 ELSE 0 
    END)) AS Points
FROM Teams t LEFT JOIN Matches m ON t.TeamID = m.Team1ID OR t.TeamID = m.Team2ID
GROUP BY t.TeamID, t.Name
ORDER BY Points DESC, Wins DESC;

-- ==========================================
-- QUERIES / CALCLATING STATS /IF NEEDED
-- ==========================================

-- 45. Find players with a batting average above 50
SELECT name,runs/totalinnings AS average
FROM playerstats p1 JOIN players p2 ON
p1.playerid=p2.playerid
WHERE runs/totalinnings> 50

-- 46. Find the bowler with the best wickets per innings ratio �
SELECT top 1 name,wickets/totalinnings AS average
FROM playerstats p1 JOIN players p2 ON
p1.playerid=p2.playerid
order by average desc

-- 47. Get players who have played more than 100 innings
SELECT name,totalinnings
FROM playerstats p1 JOIN players p2 ON
p1.playerid=p2.playerid
WHERE totalinnings> 100

-- 48. Find players who have scored more than 5000 runs but have fewer than 50 wickets
SELECT name,runs,wickets,totalinnings
FROM playerstats p1 JOIN players p2 ON
p1.playerid=p2.playerid
WHERE runs>=5000 AND wickets<50