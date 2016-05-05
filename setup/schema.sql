create table teams (
  id integer auto_increment primary key,
  name varchar(30) not null
);

insert into teams(name) values ('Analytics');
insert into teams(name) values ('Core');
insert into teams(name) values ('Financials');
insert into teams(name) values ('Operations');
insert into teams(name) values ('Ready');
insert into teams(name) values ('Research');
insert into teams(name) values ('Student');

create table events (
  id integer auto_increment primary key,
  name varchar(100) not null,
  occurring_on date not null,
  round_count integer default 1
);

create table participants (
  id integer auto_increment primary key,
  name varchar(150) not null,
  team_id integer not null,
  foreign key (team_id) references teams(id)
);

create table pairs (
  event_id integer not null,
  event_round integer default 1,
  participant1_id integer not null,
  participant2_id integer not null,
  participant3_id integer,
  foreign key (event_id) references events(id),
  foreign key (participant1_id) references participants(id),
  foreign key (participant2_id) references participants(id),
  foreign key (participant3_id) references participants(id)
);

