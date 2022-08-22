let coaching = [

    ["Select a prompt from the drop down",
    "Partner Prompt",
    "Coach Prompt"],
        
    ["Coaching on a new opportunity",
    "Parnter - You are consideinrg applying for a promotion (or a new role), but you are not confident in your abilities. The coach is a friend of yours, and the coach initiates conversation",
    "Coach - You start a conversation with a friend/peer about work 'how are things at work' and they seem to be struggling with something, coach speaks first"],

    ["Challenging Teammate",
    "Partner - You have a teammate who is hard to work with because they [don't deliver, are rude or communicate ineffectively, get distracted with unimportant work] and you're sick of it, you are about to have a 1:1 with your manager",
    "Coach - You are a manager and are having a 1:1 with your teammate, you ask how their current project is going (coach speaks first) "],

    
    ["Perceived favoritism",
    "Partner - You are frustrated because your tech lead/manager on your product team always picks <other person>. (Unspoken subtext, this other person is actually the most qualified, but you're struggling with how to grow technically)",
    "Coach - You are having a chat with a teammate and they seem unhappy, ask an opening question and see where the conversation takes you"],

    ["Divergence from practices",
    "Partner - You are working with a challenging client and are feeling some pressure to deliver, this has caused you to take some shortcuts",
    "Coach - You have noticed one of your teammates/peers on an engagement isn't quite delivering in the way we operate at Labs, you want to address the issues, you speak first"],

    ["Ignoring user research",
    "Partner - You have strong opinions on which features are most important for the product, however recent user interviews don't agree, you want to push those user requests to the next iteration and work on your personal priority first",
    "Coach - You noticed one of your teammates seems to be diverging from what we heard at the most recent batch of user interview, ask an opening question and try and figure out how to get back on track"],

    ["Scenario 3",
    "asdfasdfasdf",
    "asdfasdfasdf"]

];


function getRandom()
{

    randomOpt = Math.ceil(Math.random() * (coaching.length-1))
    document.getElementById("selectNumber").value = randomOpt;
   
    updateWorkshop();

}

function updateWorkshop()
{
    
    
    var currentSelect = document.getElementById("selectNumber").value;

    var visSelect = document.getElementById("selectVis").value;


    if(visSelect & 1)
    {
        document.getElementById("partnerPrompt").innerHTML = coaching[currentSelect][1];
    }
    else
    {
        document.getElementById("partnerPrompt").innerHTML = "";

    }

    if(visSelect & 2)
    {

        document.getElementById("coachPrompt").innerHTML = coaching[currentSelect][2];
    }
    else
    {
        document.getElementById("coachPrompt").innerHTML = "";

    }

}

function popOptions()
{
    var select = document.getElementById("selectNumber");
    
    
    for(var i = 0; i < coaching.length; i++) {
        
        var el = document.createElement("option");
        el.textContent = i + " - " + coaching[i][0];
        el.value = i;
        select.appendChild(el);
    }

}
